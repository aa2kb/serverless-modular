function addNodeModules(serverlessConfig) {
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
  } else {
    serverlessConfig.plugins = [slsDomainManager];
  }
  return serverlessConfig.plugins;
}

module.exports = {
  addNodeModules,
  adjustPlugin
};
