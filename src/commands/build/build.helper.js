const _ = require('lodash');
const replace = require('replace-in-file');
const fsPath = require('fs-path');
const utils = require('../../utils');

function adjustPackage(serverlessConfig) {
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
    }
  }
  return serverlessConfig.custom;
}

async function buildGlobalFunctions(featureFunctions) {
  const functions = {};
  let basePath;
  for (const f of featureFunctions) {
    const functionYml = await utils.ymltoJson(f.path);
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
  let localFeatureServerlessYmlPath;
  for (const i in functionYml.functions) {
    const currentFunction = functionYml.functions[i];
    currentFunction.handler = currentFunction.handler;
    const functionName = `${i}`;
    localFeatureFunctions[functionName] = currentFunction;
    serverlessConfig.functions = localFeatureFunctions;
    serverlessConfig.package = adjustPackage(serverlessConfig);
    serverlessConfig.plugins = adjustPlugin(serverlessConfig);
    serverlessConfig.custom = adjustCustom(serverlessConfig, basePath);
    localFeatureServerlessYmlPath = `${cwd}/src/${feature.name}/serverless.yml`;
    fsPath.writeFileSync(localFeatureServerlessYmlPath, utils.jsontoYml(serverlessConfig));
    const options = {
      files: localFeatureServerlessYmlPath,
      from: [/\$\{file\(/g],
      to: '${file(../../',
    };
    await replace(options);
  }
}

async function globalBuild(featureFunctions, feature, cwd) {
  const mainFunctionsPath = `${cwd}/smm.functions.yml`;
  const mainFunctions = await buildGlobalFunctions(featureFunctions);
  fsPath.writeFileSync(mainFunctionsPath, utils.jsontoYml(mainFunctions.functions));
}

async function localBuild(featureFunctions, feature, cwd) {
  const mainServerlessYmlPath = `${cwd}/serverless.yml`;
  const serverlessConfig = await utils.ymltoJson(mainServerlessYmlPath);
  for (const f of featureFunctions) {
    const functionYml = await utils.ymltoJson(f.path);
    const basePath = functionYml.basePath;
    serverlessConfig.service = `${serverlessConfig.service}-${f.name}`;
    await buildLocalSLSConfig(serverlessConfig, basePath, cwd, f, functionYml);
  }
}

module.exports = {
  adjustPackage,
  adjustPlugin,
  adjustCustom,
  globalBuild,
  localBuild
};
