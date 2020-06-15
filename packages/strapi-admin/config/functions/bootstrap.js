'use strict';

const _ = require('lodash');
const adminActions = require('../admin-actions');

const registerPermissionActions = () => {
  const { actionProvider } = strapi.admin.services.permission;
  actionProvider.register(adminActions.actions);
};

const registerAdminConditions = () => {
  const { conditionProvider } = strapi.admin.services.permission;

  conditionProvider.register({
    displayName: 'Is Creator',
    name: 'is-creator',
    plugin: 'admin',
    handler: user => ({ 'created_by.id': user.id }),
  });
};

const cleanPermissionInDatabase = async () => {
  const { actionProvider } = strapi.admin.services.permission;
  const dbPermissions = await strapi.admin.services.permission.find();
  const allActionsMap = actionProvider.getAllByMap();
  const permissionsToRemoveIds = [];

  dbPermissions.forEach(perm => {
    if (
      !allActionsMap.has(perm.action) ||
      (allActionsMap.get(perm.action).section === 'contentTypes' &&
        !allActionsMap.get(perm.action).subjects.includes(perm.subject))
    ) {
      permissionsToRemoveIds.push(perm.id);
    }
  });

  await strapi.admin.services.permission.deleteByIds(permissionsToRemoveIds);
};

const getNestedFields = (attributes, fieldPath = '', nestingLevel = 3) => {
  if (nestingLevel === 0) {
    return fieldPath ? [fieldPath] : [];
  }

  const fields = [];
  _.forIn(attributes, (attribute, attributeName) => {
    const newFieldPath = fieldPath ? `${fieldPath}.${attributeName}` : attributeName;

    if (attribute.type === 'component') {
      const component = strapi.components[attribute.component];
      const componentFields = getNestedFields(component.attributes, newFieldPath, nestingLevel - 1);
      fields.push(...componentFields);
    } else {
      fields.push(newFieldPath);
    }
  });

  return fields;
};

const createRolesIfNeeded = async () => {
  const someRolesExist = await strapi.admin.services.role.exists();
  if (someRolesExist) {
    return;
  }

  const defaultActionsIds = [
    'plugins::content-manager.read',
    'plugins::content-manager.create',
    'plugins::content-manager.update',
    'plugins::content-manager.delete',
  ];
  const allActions = strapi.admin.services.permission.actionProvider.getAll();
  const contentTypesActions = allActions.filter(a => defaultActionsIds.includes(a.actionId));

  await strapi.admin.services.role.create({
    name: 'Super Admin',
    code: 'strapi-super-admin',
    description: 'Super Admins can access and manage all features and settings.',
  });

  const editorRole = await strapi.admin.services.role.create({
    name: 'Editor',
    code: 'strapi-editor',
    description: 'Editors can manage and publish contents including those of other users.',
  });

  const authorRole = await strapi.admin.services.role.create({
    name: 'Author',
    code: 'strapi-author',
    description: 'Authors can manage and publish their own content.',
  });

  const editorPermissions = [];
  contentTypesActions.forEach(action => {
    _.forIn(strapi.contentTypes, contentType => {
      if (action.subjects.includes(contentType.uid)) {
        const fields = getNestedFields(contentType.attributes);
        editorPermissions.push({
          action: action.actionId,
          subject: contentType.uid,
          fields,
        });
      }
    });
  });

  await strapi.admin.services.permission.assign(editorRole.id, editorPermissions);
  await strapi.admin.services.permission.assign(authorRole.id, editorPermissions);
};

const displayWarningIfNoSuperAdmin = async () => {
  const adminRole = await strapi.admin.services.role.getAdminWithUsersCount();
  const someUsersExists = await strapi.admin.services.user.exists();
  if (!adminRole) {
    return strapi.log.warn("Your application doesn't have a super admin role.");
  } else if (someUsersExists && adminRole.usersCount === 0) {
    return strapi.log.warn("Your application doesn't have a super admin user.");
  }
};

const displayWarningIfUsersDontHaveRole = async () => {
  const count = await strapi.admin.services.user.countUsersWithoutRole();

  if (count > 0) {
    strapi.log.warn(`You have ${count} user${count === 1 ? '' : 's'} without any role.`);
  }
};

module.exports = async () => {
  registerAdminConditions();
  registerPermissionActions();
  await cleanPermissionInDatabase();
  await createRolesIfNeeded();
  await displayWarningIfNoSuperAdmin();
  await displayWarningIfUsersDontHaveRole();
};
