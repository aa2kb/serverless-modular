const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const utils = require('../../utils');
const removeHelper = require('../remove/remove.helper');
const messages = require('../../messages');

class removeClass {
  removeHandler() {
    utils.log.info('Removing Services');
    const savedOpts = _.get(this.serverless, 'variables.service.custom.smConfig.deploy', {});
    const scope = this.options['sm-scope'] || savedOpts.scope || 'global';
    let parallel = this.options['sm-parallel'] ? this.options['sm-parallel'] === 'true' : false;
    if (_.has(savedOpts, 'parallel')) {
      parallel = savedOpts.parallel;
    }
    let features = savedOpts.features || this.options['sm-features'] || null;
    const srcPath = `${this.cwd}${path.sep}src`;
    let featureFunctions;
    if (fs.existsSync(srcPath)) {
      featureFunctions = utils.getFeaturePath(srcPath);
    }
    features = features ? features.split(',') : null;
    const cwd = this.cwd;
    // const scopeErrMsg = 'Invalid use of scope flag\n\n only set to "--scope local or --scope global" while using this flag';
    return new Promise(async (resolve, reject) => {
      try {
        switch (scope) {
          case 'local':
            await removeHelper.localRemove(cwd, savedOpts.options, parallel, features);
            break;
          case 'global':
            await removeHelper.globalRemove(cwd, savedOpts.options);
            break;
          default:
            utils.log.errorMessage(messages.INVALID_SCOPE);
            throw new Error(messages.INVALID_SCOPE);
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = removeClass;
