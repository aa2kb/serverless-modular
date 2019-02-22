const jsYaml = require('js-yaml');
const jsonYml = require('json-to-pretty-yaml');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const chalk = require('chalk');
const messages = require('./messages');

async function ymlToJson(filename) {
  try {
    if (fs.existsSync(filename)) {
      return jsYaml.safeLoad(await fs.readFileAsync(filename, 'utf8').then(data => data));
    }
    return null;
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
    const fSplit = f.split(path.sep);
    const fName = fSplit[fSplit.length - 1];
    if (onlyFeatures) {
      return {
        path: f,
        name: fName
      };
    }
    return {
      path: `${f}${path.sep}${fName}-functions.yml`,
      name: fName
    };
  }).filter((feature) => { // eslint-disable-line
    return filterFeatures ? filterFeatures.includes(feature.name) : true;
  }).filter((f) => {
    const functionYmlPath = f.path.endsWith('-functions.yml') ? f.path : `${f.path}${path.sep}${f.name}-functions.yml`;
    return fs.existsSync(functionYmlPath);
  });
}

async function getBasePath(ymlPath) {
  try {
    const functionYml = await ymlToJson(ymlPath);
    return functionYml ? functionYml.basePath : null;
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
    const baseBath = getBasePath(f.path);
    if (baseBath) {
      promises.push(baseBath);
    }
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

function logger(data, error) {
  console.log(`${error ? '⚠️' : 'ℹ️'}  Serverless-Modular: ${chalk.yellow(data)}`);
}
const log = {
  info(data) {
    logger(data);
  },
  warn(data) {
    logger(data, true);
  },
  errorMessage(message) {
    console.log(`
  ${chalk.yellow('Serverless Modular Error ---------------------------------------')}

  ${message}
  
  ${chalk.yellow('Get Support --------------------------------------------')}
    ${chalk.yellow('Docs:')}         github.com/aa2kb/serverless-modular#readme
    ${chalk.yellow('Bugs:')}         github.com/aa2kb/serverless-modular/issues
    ${chalk.yellow('Github:')}       github.com/aa2kb/serverless-modular
    `);
  }
};

function getEsVersion(serverlessConfig) {
  const validEsVersion = ['es6', 'es5'];
  if (serverlessConfig.custom && serverlessConfig.custom.smConfig && serverlessConfig.custom.smConfig.esVersion) {
    if (validEsVersion.includes(serverlessConfig.custom.smConfig.esVersion)) {
      return serverlessConfig.custom.smConfig.esVersion;
    }
    log.errorMessage.errorMessage(messages.INVALID_ES_VERSION);
    throw new Error(messages.INVALID_ES_VERSION);
  } else {
    return 'es5';
  }
}

function validBasePath(basePath) {
  const validChars = basePath.search(/^[a-zA-Z0-9-_]+$/) === 0;
  const startCheck = !(basePath.startsWith('_') || basePath.startsWith('-'));
  const endCheck = !(basePath.endsWith('_') || basePath.endsWith('-'));
  return validChars && startCheck && endCheck;
}

module.exports = {
  ymlToJson,
  jsontoYml,
  getFeaturePath,
  existsInFile,
  fileExits,
  getEsVersion,
  checkIfBasePathIsInUse,
  checkIfBasePathDuplicate,
  log,
  validBasePath
};
