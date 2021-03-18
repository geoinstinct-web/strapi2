'use strict';

const _ = require('lodash');
const { subject: asSubject } = require('@casl/ability');
const { permittedFieldsOf } = require('@casl/ability/extra');
const {
  sanitizeEntity,
  contentTypes: { constants },
} = require('strapi-utils');
const { buildStrapiQuery, buildCaslQuery } = require('./query-builers');

module.exports = ({ ability, action, model }) => ({
  ability,
  action,
  model,

  get isAllowed() {
    return this.ability.can(action, model);
  },

  permittedFieldsOf(actionOverride = action) {
    return permittedFieldsOf(ability, actionOverride, model);
  },

  toSubject(target, subjectType = model) {
    return asSubject(subjectType, target);
  },

  pickPermittedFieldsOf(data, options = {}) {
    return this.sanitize(data, { ...options, isOutput: false });
  },

  getQuery(queryAction = action) {
    if (_.isUndefined(queryAction)) {
      throw new Error('Action must be defined to build a permission query');
    }

    return buildStrapiQuery(buildCaslQuery(ability, queryAction, model));
  },

  queryFrom(query = {}, action) {
    const permissionQuery = this.getQuery(action);
    return {
      ...query,
      _where: query._where ? _.concat(permissionQuery, query._where) : [permissionQuery],
    };
  },

  sanitize(data, options = {}) {
    const {
      subject = this.toSubject(data),
      action: actionOverride = action,
      withPrivate = true,
      isOutput = true,
    } = options;

    if (_.isArray(data)) {
      return data.map(entity => this.sanitize(entity, { action, withPrivate, isOutput }));
    }

    const permittedFields = permittedFieldsOf(ability, actionOverride, subject);
    const hasAtLeastOneRegisteredField = _.some(
      _.flatMap(ability.rulesFor(actionOverride, subject), 'fields')
    );
    const shouldIncludeAllFields = _.isEmpty(permittedFields) && !hasAtLeastOneRegisteredField;

    const sanitizedEntity = sanitizeEntity(data, {
      model: strapi.getModel(model),
      includeFields: shouldIncludeAllFields ? null : permittedFields,
      withPrivate,
      isOutput,
    });

    return _.omit(sanitizedEntity, [
      `${constants.CREATED_BY_ATTRIBUTE}.roles`,
      `${constants.UPDATED_BY_ATTRIBUTE}.roles`,
    ]);
  },
});
