
const validEsVersion = ['es6', 'es5'];
function getEsVersion(serverlessConfig) {
  if (serverlessConfig.custom && serverlessConfig.custom.smmConfig && serverlessConfig.custom.smmConfig.esVersion) {
    if (validEsVersion.includes(serverlessConfig.custom.smmConfig.esVersion)) {
      return serverlessConfig.custom.smmConfig.esVersion;
    }
    throw new Error('Invalid esVersion at smmConfig in serverless.yml');
  } else {
    return 'es6';
  }
}

module.exports = {
  getEsVersion
};
