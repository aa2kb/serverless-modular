const buildHelper = require('./build.helper');
const utils = require('../../utils');
const messages = require('../../messages');

class buildClass {
  async createFunctionsYml() {
    const feature = this.options.feature;
    const scope = this.options.scope;
    const srcPath = `${this.cwd}/src`;
    const basePathDuplicate = await utils.checkIfBasePathDuplicate(srcPath);
    let featureFunctions = [];
    if (scope && (scope !== 'local' && scope !== 'global')) {
      utils.log.errorMessage(messages.INVALID_SCOPE);
      throw new Error(messages.INVALID_SCOPE);
    }
    if (basePathDuplicate) {
      utils.log.errorMessage(messages.DUPLICATE_PATH);
      throw new Error(messages.DUPLICATE_PATH);
    }
    if (feature) {
      featureFunctions = [{
        path: `${srcPath}/${feature}/${feature}-functions.yml`,
        name: feature
      }];
    } else {
      featureFunctions = utils.getFeaturePath(srcPath);
    }
    if (scope === 'local') {
      await buildHelper.localBuild(featureFunctions, feature, this.cwd);
      utils.log.info(`Local '${featureFunctions.map(f => f.name).join()}' feature build successful`);
    } else {
      await buildHelper.globalBuild(featureFunctions, feature, this.cwd);
      utils.log.info(`${feature ? `Global '${feature}' Feature` : 'Global'} build successful`);
    }
  }
}

module.exports = buildClass;
