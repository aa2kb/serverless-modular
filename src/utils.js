const jsYaml = require('js-yaml');
const jsonYml = require('json-to-pretty-yaml');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

async function ymlToJson(filename) {
  try {
    return jsYaml.safeLoad(await fs.readFileAsync(filename, 'utf8').then(data => data));
  } catch (err) {
    throw (err);
  }
}

function jsontoYml(jsonData) {
  return jsonYml.stringify(jsonData);
}

function isDirectory(source) {
  return fs.lstatSync(source).isDirectory();
}

function getFeaturePath(source, onlyFeatures, filterFeatures) {
  return fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory).map((f) => {
    const fSplit = f.split('/');
    const fName = fSplit[fSplit.length - 1];
    if (onlyFeatures) {
      return {
        path: f,
        name: fName
      };
    }
    return {
      path: `${f}/${fName}-functions.yml`,
      name: fName
    };
  }).filter((feature) => {
    return filterFeatures ? filterFeatures.includes(feature.name) : true;
  });
}

async function getBasePath(ymlPath) {
  try {
    const functionYml = await ymlToJson(ymlPath);
    return functionYml.basePath;
  } catch (err) {
    throw (err);
  }
}

async function checkIfBasePathIsInUse(srcPath, newBasePath) {
  const features = getFeaturePath(srcPath);
  const promises = [];
  for (const f of features) {
    promises.push(getBasePath(f.path));
  }
  const results = await Promise.all(promises);
  for (const basePath of results) {
    if (basePath === newBasePath) {
      return true;
    }
  }
  return false;
}

async function checkIfBasePathDuplicate(srcPath) {
  const features = getFeaturePath(srcPath);
  const promises = [];
  for (const f of features) {
    promises.push(getBasePath(f.path));
  }
  const allBasePaths = await Promise.all(promises);
  return _.uniq(allBasePaths).length !== allBasePaths.length;
}

function existsInFile(text, filePath) {
  return fs.readFileSync(filePath).indexOf(text) >= 0;
}

function fileExits(filePath) {
  return fs.existsSync(filePath);
}


function getEsVersion(serverlessConfig) {
  const validEsVersion = ['es6', 'es5'];
  if (serverlessConfig.custom && serverlessConfig.custom.smConfig && serverlessConfig.custom.smConfig.esVersion) {
    if (validEsVersion.includes(serverlessConfig.custom.smConfig.esVersion)) {
      return serverlessConfig.custom.smConfig.esVersion;
    }
    throw new Error('Invalid esVersion at smConfig in serverless.yml');
  } else {
    return 'es5';
  }
}

module.exports = {
  ymlToJson,
  jsontoYml,
  getFeaturePath,
  existsInFile,
  fileExits,
  getEsVersion,
  checkIfBasePathIsInUse,
  checkIfBasePathDuplicate
};
