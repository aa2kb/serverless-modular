const _ = require('lodash');
const deployHelper = require('./deploy.helper');
const buildHelper = require('./../build/build.helper');
const utils = require('../../utils');

class deployClass {
  deployHandler() {
    const savedOpts = _.get(this.serverless, 'variables.service.custom.smConfig.deploy.options', false);
    const scope = this.options['sm-scope'] || 'local';
    const parallel = this.options['sm-parallel'] === 'true';
    let features = this.options['sm-features'];
    const srcPath = `${this.cwd}/src`;
    const featureFunctions = utils.getFeaturePath(srcPath);
    features = features ? features.split(',') : null;
    const cwd = this.cwd;
    return new Promise(async (resolve, reject) => {
      try {
        if (parallel && scope !== 'local') {
          throw new Error('Use parallel deployments only when deploying local features');
        }
        switch (scope) {
          case 'local':
            await buildHelper.localBuild(featureFunctions, null, cwd);
            this.serverless.cli.log('Local build successful');
            await deployHelper.localDeploy(cwd, savedOpts, parallel, features);
            break;
          case 'global':
            await buildHelper.globalBuild(featureFunctions, null, cwd);
            this.serverless.cli.log('Global build successful');
            await deployHelper.globalDeploy(cwd, savedOpts);
            break;
          default:
            throw new Error('Invalid use of scope flag\n\n only set to "--scope local or --scope global" while using this flag');
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = deployClass;
