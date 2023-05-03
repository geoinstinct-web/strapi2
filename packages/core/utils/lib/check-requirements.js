'use strict';

const { red, green, bold, yellow } = require('chalk');
const semver = require('semver');
const packageJSON = require('../../../../package.json');

module.exports = () => {
  const currentNodeVersion = process.versions.node;
  const { engines } = packageJSON;

  // error if the node version isn't supported
  if (!semver.satisfies(currentNodeVersion, engines.node)) {
    console.error(red(`You are running ${bold(`Node.js ${currentNodeVersion}`)}`));
    console.error(`Strapi requires ${bold(green(`Node.js ${engines.node}`))}`);
    console.error('Please make sure to use the right version of Node.');
    throw new Error('Invalid Node Version');
  }

  // warn if not using a LTS version
  if (semver.satisfies(currentNodeVersion, '15.x.x || 17.x.x || 19.x.x')) {
    console.warn(yellow(`You are running ${bold(`Node.js ${currentNodeVersion}`)}`));
    console.warn(
      `Strapi only supports ${bold(
        green('LTS versions of Node.js')
      )}, other versions may not be compatible.`
    );
  }
};
