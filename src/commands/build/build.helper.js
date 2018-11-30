const _ = require('lodash');
const replace = require('replace-in-file');
const fsPath = require('fs-path');
const cpFile = require('cp-file');
const utils = require('../../utils');

function adjustPackage(slsConfig) {
  const serverlessConfig = Object.assign({}, slsConfig);
  const npmPath = '../../node_modules';
  if (serverlessConfig.package) {
    if (serverlessConfig.package.include && !serverlessConfig.package.include.includes(npmPath)) {
      serverlessConfig.package.include.push(npmPath);
    } else {
      serverlessConfig.package.include = [npmPath];
    }
  } else {
    serverlessConfig.package = {
      include: [npmPath]
    };
  }
  return serverlessConfig;
}

function adjustPlugin(slsConfig) {
  const serverlessConfig = Object.assign({}, slsConfig);
  const slsDomainManager = 'serverless-domain-manager';
  const addDomainManager = _.get(serverlessConfig, 'custom.smConfig.build.add-domain-manager', false);
  if (serverlessConfig.plugins) {
    if (!serverlessConfig.plugins.includes(slsDomainManager) && addDomainManager) {
      serverlessConfig.plugins.push(slsDomainManager);
    }
    _.pull(serverlessConfig.plugins, 'serverless-modular');
  } else if (addDomainManager) {
    serverlessConfig.plugins = [slsDomainManager];
  }
  return serverlessConfig;
}

function adjustCustom(slsConfig, basePath) {
  const serverlessConfig = Object.assign({}, slsConfig);
  const addDomainManager = _.get(serverlessConfig, 'custom.smConfig.build.add-domain-manager', false);
  if (serverlessConfig.custom && addDomainManager) {
    if (serverlessConfig.custom.customDomain) {
      serverlessConfig.custom = {
        ...serverlessConfig.custom,
        customDomain: {
          ...serverlessConfig.custom.customDomain,
          basePath
        }
      };
    }
  } else if (serverlessConfig.custom) {
    delete serverlessConfig.custom.customDomain;
  }
  serverlessConfig.custom = _.omit(serverlessConfig.custom, ['smConfig']);
  if (_.keys(serverlessConfig.custom).length <= 0) {
    delete serverlessConfig.custom;
  }
  return serverlessConfig;
}

async function buildGlobalFunctions(featureFunctions) {
  const functions = {};
  let basePath;
  for (const f of featureFunctions) {
    const functionYml = await utils.ymlToJson(f.path);
    basePath = functionYml.basePath;
    for (const i in functionYml.functions) {
      const currentFunction = functionYml.functions[i];
      currentFunction.handler = `src/${f.name}/${currentFunction.handler}`;
      for (const j in currentFunction.events) {
        const currentPath = currentFunction.events[j].http.path;
        currentFunction.events[j].http.path = `${functionYml.basePath}/${currentPath}`;
      }
      const functionName = `${f.name}-${i}`;
      functions[functionName] = currentFunction;
    }
  }
  return {
    basePath,
    functions
  };
}

async function buildLocalSLSConfig(serverlessConfig, basePath, cwd, feature, functionYml) {
  const localFeatureFunctions = {};
  const localFeatureServerlessYmlPath = `${cwd}/src/${feature.name}/serverless.yml`;
  const baseWebPackConfig = `${cwd}/webpack.config.js`;
  const targetWebPackConfig = `${cwd}/src/${feature.name}/webpack.config.js`;
  const webpackExists = _.get(serverlessConfig, 'plugins').includes('serverless-webpack');
  for (const i in functionYml.functions) {
    const currentFunction = functionYml.functions[i];
    currentFunction.handler = currentFunction.handler;
    const functionName = `${i}`;
    localFeatureFunctions[functionName] = currentFunction;
  }
  serverlessConfig.functions = localFeatureFunctions;
  serverlessConfig = adjustPackage(serverlessConfig);
  serverlessConfig = adjustPlugin(serverlessConfig);
  serverlessConfig = adjustCustom(serverlessConfig, basePath);
  fsPath.writeFileSync(localFeatureServerlessYmlPath, utils.jsontoYml(serverlessConfig));
  if (webpackExists) {
    cpFile(baseWebPackConfig, targetWebPackConfig);
  }
  const options = {
    files: localFeatureServerlessYmlPath,
    from: [/\$\{file\(/g],
    to: '${file(../../',
  };
  await replace(options);
}

async function globalBuild(featureFunctions, feature, cwd) {
  const mainFunctionsPath = `${cwd}/sm.functions.yml`;
  const mainFunctions = await buildGlobalFunctions(featureFunctions);
  fsPath.writeFileSync(mainFunctionsPath, utils.jsontoYml(mainFunctions.functions));
}

async function localBuild(featureFunctions, feature, cwd) {
  const mainServerlessYmlPath = `${cwd}/serverless.yml`;
  const serverlessConfig = await utils.ymlToJson(mainServerlessYmlPath);
  for (const f of featureFunctions) {
    const functionYml = await utils.ymlToJson(f.path);
    const basePath = functionYml.basePath;
    serverlessConfig.service = `${serverlessConfig.service}-${f.name}`;
    await buildLocalSLSConfig(serverlessConfig, basePath, cwd, f, functionYml);
  }
}

module.exports = {
  globalBuild,
  localBuild
};
