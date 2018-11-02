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
    } else {
      throw (new Error('customDomain is missing in root serverless.yml\nKindly Visit to install the plugin https://github.com/amplify-education/serverless-domain-manager'));
    }
  } else {
    throw (new Error('customDomain is missing in root serverless.yml\nKindly Visit to install the plugin https://github.com/amplify-education/serverless-domain-manager'));
  }
  return serverlessConfig.custom;
}

async function buildFunctions(featureFunctions, scope) {
  const functions = {};
  let basePath;
  for (const f of featureFunctions) {
    const functionYml = await utils.ymltoJson(f.path);
    basePath = functionYml.basePath;
    for (const i in functionYml.functions) {
      const currentFunction = functionYml.functions[i];
      currentFunction.handler = scope === 'local' ? currentFunction.handler : `src/${f.name}/${currentFunction.handler}`;
      for (const j in currentFunction.events) {
        const currentPath = currentFunction.events[j].http.path;
        currentFunction.events[j].http.path = scope === 'local' ? `${currentPath}` : `${functionYml.basepath}/${currentPath}`;
      }
      const functionName = scope === 'local' ? `${i}` : `${f.name}-${i}`;
      functions[functionName] = currentFunction;
    }
  }
  return {
    basePath,
    functions
  };
}

async function globalBuild(featureFunctions, feature, cwd) {
  const mainFunctionsPath = `${cwd}/functions.yml`;
  const mainFunctions = await buildFunctions(featureFunctions, 'global');
  fsPath.writeFileSync(mainFunctionsPath, utils.jsontoYml(mainFunctions.functions));
}

async function localBuild(featureFunctions, feature, cwd) {
  const mainFunctions = await buildFunctions(featureFunctions, 'local');
  const mainServerlessYmlPath = `${cwd}/serverless.yml`;
  const serverlessConfig = await utils.ymltoJson(mainServerlessYmlPath);
  if (feature) {
    const basePath = mainFunctions.basePath;
    const featureServerlessYmlPath = `${cwd}/src/${feature}/serverless.yml`;
    serverlessConfig.functions = mainFunctions.functions;
    serverlessConfig.service = `${serverlessConfig.service}-${feature}`;
    serverlessConfig.package = adjustPackage(serverlessConfig);
    serverlessConfig.plugins = adjustPlugin(serverlessConfig);
    serverlessConfig.custom = adjustCustom(serverlessConfig, basePath);
    fsPath.writeFileSync(featureServerlessYmlPath, utils.jsontoYml(serverlessConfig));
    const options = {
      files: featureServerlessYmlPath,
      from: [/\$\{file\(/g],
      to: '${file(../../',
    };
    await replace(options);
  } else {
    for (const f of featureFunctions) {
      let localFeatureServerlessYmlPath;
      const localFeatureFunctions = {};
      const functionYml = await utils.ymltoJson(f.path);
      const basePath = functionYml.basePath;
      for (const i in functionYml.functions) {
        const currentFunction = functionYml.functions[i];
        currentFunction.handler = currentFunction.handler;
        const functionName = `${i}`;
        localFeatureFunctions[functionName] = currentFunction;
        serverlessConfig.functions = localFeatureFunctions;
        serverlessConfig.service = `${serverlessConfig.service}-${f.name}`;
        serverlessConfig.package = adjustPackage(serverlessConfig);
        serverlessConfig.plugins = adjustPlugin(serverlessConfig);
        serverlessConfig.custom = adjustCustom(serverlessConfig, basePath);
        localFeatureServerlessYmlPath = `${cwd}/src/${f.name}/serverless.yml`;
        fsPath.writeFileSync(localFeatureServerlessYmlPath, utils.jsontoYml(serverlessConfig));
        const options = {
          files: localFeatureServerlessYmlPath,
          from: [/\$\{file\(/g],
          to: '${file(../../',
        };
        await replace(options);
      }
    }
  }
}

module.exports = {
  adjustPackage,
  adjustPlugin,
  adjustCustom,
  globalBuild,
  localBuild
};
