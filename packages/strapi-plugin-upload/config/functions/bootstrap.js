'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 */

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

module.exports = async cb => {
  // set plugin store
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'plugin',
    name: 'upload'
  });

  strapi.plugins.upload.config.providers = [];

  const loadProviders = (basePath, cb) => {
    fs.readdir(path.join(basePath, 'node_modules'), async (err, node_modules) => {
      // get all upload provider
      const uploads = _.filter(node_modules, (node_module) => {
        // DEPRECATED strapi-upload-* will be remove in next version
        return _.startsWith(node_module, 'strapi-provider-upload') || _.startsWith(node_module, 'strapi-upload');
      });

      // mount all providers to get configs
      _.forEach(uploads, (node_module) => {
        strapi.plugins.upload.config.providers.push(
          require(path.join(`${basePath}/node_modules/${node_module}`))
        );
      });

      try {
        // if provider config not exit set one by default
        const config = await pluginStore.get({key: 'provider'});

        if (!config) {
          const provider = _.find(strapi.plugins.upload.config.providers, {provider: 'local'});

          const value = _.assign({}, provider, {
            enabled: true,
            // by default limit size to 1 GB
            sizeLimit: 1000000
          });

          await pluginStore.set({key: 'provider', value});

          const dirPath = `${strapi.config.appPath}/public/uploads`;
   
          try {
            // Check if directory exists
            await new Promise((resolve, reject) => fs.exists(dirPath, (exists) => {
              if (exists) {
                resolve();
              } else {
                // Create directory if not exists
                fs.mkdir(dirPath, {recursive: true}, (err) => {
                  if (err) {
                    return reject(err);
                  }

                  resolve();
                });
              }
            });
          } catch (err) {
            strapi.log.error(`Can't access to the public folder`);
            strapi.log.warn(`Please change access mode / owner to the public folder`);
            strapi.stop();  
          }
        }
      } catch (err) {
        strapi.log.error(`Can't load ${config.provider} upload provider.`);
        strapi.log.warn(`Please install strapi-provider-upload-${config.provider} --save in ${path.join(strapi.config.appPath, 'plugins', 'upload')} folder.`);
        strapi.stop();
      }

      cb();
    });
  };

  // Load providers from the plugins' node_modules.
  loadProviders(path.join(strapi.config.appPath, 'plugins', 'upload'), () => {
    // Load providers from the root node_modules.
    loadProviders(path.join(strapi.config.appPath), cb);
  });

};
