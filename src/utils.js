const jsYaml = require('js-yaml');
const jsonYml = require('json-to-pretty-yaml');
const fs = require('fs');
const path = require('path');

async function ymltoJson(filename) {
  return jsYaml.safeLoad(await fs.readFileAsync(filename, 'utf8').then(data => data));
}

function jsontoYml(jsonData) {
  return jsonYml.stringify(jsonData);
}

function isDirectory(source) {
  return fs.lstatSync(source).isDirectory();
}

function getFeaturePath(source) {
  return fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
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
    return 'es6';
  }
}

module.exports = {
  ymltoJson,
  jsontoYml,
  getFeaturePath,
  existsInFile,
  fileExits,
  getEsVersion
};
