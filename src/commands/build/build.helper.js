const _ = require('lodash');
const path = require('path');
const replace = require('replace-in-file');
const fsPath = require('fs-path');
const fs = require('fs');
const utils = require('../../utils');
const messages = require('../../messages');

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
  const addDomainManager = _.get(serverlessConfig, 'custom.smConfig.build.addDomainManager', false);
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

function adjustCustom(slsConfig, basePath, webpackExists) {
  const serverlessConfig = Object.assign({}, slsConfig);
  const addDomainManager = _.get(serverlessConfig, 'custom.smConfig.build.addDomainManager', false);
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

  if (webpackExists) {
    const currentWebpackConfig = _.get(serverlessConfig, 'custom.webpackConfig.webpackConfig', 'webpack.config.js');
    serverlessConfig.custom = {
      ...serverlessConfig.custom,
      webpack: {
        ...serverlessConfig.custom.webpack,
        webpackConfig: `../../${currentWebpackConfig}`
      }
    };
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
  if (!featureFunctions || featureFunctions.length <= 0) {
    utils.log.errorMessage(messages.ERROR_NO_FEATURE);
    throw new Error(messages.ERROR_NO_FEATURE);
  }
  for (const f of featureFunctions) {
    if (fs.existsSync(f.path)) {
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
  }
  return {
    basePath,
    functions
  };
}

async function buildLocalSLSConfig(serverlessConfig, basePath, cwd, feature, functionYml) {
  const localFeatureFunctions = {};
  const localFeatureServerlessYmlPath = `${cwd}${path.sep}src${path.sep}${feature.name}${path.sep}serverless.yml`;
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
  serverlessConfig = adjustCustom(serverlessConfig, basePath, webpackExists);
  fsPath.writeFileSync(localFeatureServerlessYmlPath, utils.jsontoYml(serverlessConfig));
  const options = {
    files: localFeatureServerlessYmlPath,
    from: [/\$\{file\(/g],
    to: '${file(../../',
  };
  await replace(options);
}

async function globalBuild(featureFunctions, feature, cwd) {
  const mainFunctionsPath = `${cwd}${path.sep}sm.functions.yml`;
  const mainFunctions = await buildGlobalFunctions(featureFunctions);
  fsPath.writeFileSync(mainFunctionsPath, utils.jsontoYml(mainFunctions.functions));
}

async function localBuild(featureFunctions, feature, cwd) {
  const mainServerlessYmlPath = `${cwd}${path.sep}serverless.yml`;
  const serverlessConfig = await utils.ymlToJson(mainServerlessYmlPath);
  const baseName = serverlessConfig.service.toString();
  for (const f of featureFunctions) {
    const functionYml = await utils.ymlToJson(f.path);
    if (functionYml) {
      const basePath = functionYml.basePath;
      serverlessConfig.service = `${baseName}-${f.name}`;
      await buildLocalSLSConfig(serverlessConfig, basePath, cwd, f, functionYml);
    }
  }
}

module.exports = {
  globalBuild,
  localBuild
};
