const _ = require('lodash');

function adjustPackage(serverlessConfig) {
  if (serverlessConfig.package) {
    if (serverlessConfig.package.include) {
      serverlessConfig.package.include.push('../../node_modules');
    } else {
      serverlessConfig.package.include = ['../../node_modules'];
    }
  } else {
    serverlessConfig.package = {
      include: ['../../node_modules/**']
    };
  }
  return serverlessConfig.package;
}

function adjustPlugin(serverlessConfig) {
  const slsDomainManager = 'serverless-domain-manager';
  if (serverlessConfig.plugins) {
    if (!serverlessConfig.plugins.includes(slsDomainManager)) {
      serverlessConfig.plugins.push(slsDomainManager);
    }
    _.pull(serverlessConfig.plugins, 'serverless-feature-manager');
  } else {
    serverlessConfig.plugins = [slsDomainManager];
  }
  return serverlessConfig.plugins;
}

function adjustCustom(serverlessConfig, basePath) {
  if (serverlessConfig.custom) {
    if (serverlessConfig.custom.customDomain) {
      serverlessConfig.custom = {
        ...serverlessConfig.custom,
        customDomain: {
          ...serverlessConfig.custom.customDomain,
          basePath
        }
      };
    } else {
      throw (new Error('customDomain is missing in root serverless.yml\nKindly Visit to install the plugin https://github.com/amplify-education/serverless-domain-manager'));
    }
  } else {
    throw (new Error('customDomain is missing in root serverless.yml\nKindly Visit to install the plugin https://github.com/amplify-education/serverless-domain-manager'));
  }
  return serverlessConfig.custom;
}

module.exports = {
  adjustPackage,
  adjustPlugin,
  adjustCustom
};
