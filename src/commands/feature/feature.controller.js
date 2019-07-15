const fsPath = require('fs-path');
const format = require('string-template');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const nrc = require('node-run-cmd');
const _ = require('lodash');
const utils = require('../../utils');
const messages = require('../../messages');

class featureClass {
  featureHandler() {
    const createFeatureFiles = function () {
      return new Promise(async (resolve, reject) => {
        try {
          const esVersion = _.get(this.serverless, 'variables.service.custom.smConfig.esVersion', 'es5');
          const srcPath = `${this.cwd}${path.sep}src`;
          const formatData = {
            feature: this.options.name,
            featureInitCap: _.startCase(this.options.name),
            basePath: this.options.basePath || this.options.name
          };
          if (!utils.validBasePath(formatData.basePath)) {
            utils.log.errorMessage(messages.INVALID_BASE_PATH(this.options.name));
            throw new Error(messages.INVALID_BASE_PATH(this.options.name));
          }
          const basePathExists = fs.existsSync(srcPath) ? await utils.checkIfBasePathIsInUse(srcPath, formatData.basePath) : false;
          if (fs.existsSync(`${this.cwd}${path.sep}src${path.sep}${this.options.name}`)) {
            utils.log.errorMessage(messages.FEATURE_ALREADY_EXISTS(this.options.name));
            throw new Error(messages.FEATURE_ALREADY_EXISTS(this.options.name));
          }
          if (basePathExists) {
            utils.log.errorMessage(messages.BASE_PATH_EXISTS(formatData.basePath));
            throw new Error(messages.BASE_PATH_EXISTS(formatData.basePath));
          }
          for (const i in this.featureSet) {
            const file = `${this.options.name}-${this.featureSet[i].name}.${this.featureSet[i].extension}`.toLowerCase();
            const filePath = `${this.cwd}${path.sep}src${path.sep}${this.options.name}${path.sep}${file}`.toLowerCase();
            let template;
            if (this.featureSet[i].name === 'controller' || this.featureSet[i].name === 'handler' || this.featureSet[i].name === 'model') {
              template = this.featureSet[i].template[esVersion];
            } else {
              template = this.featureSet[i].template;
            }
            if (fs.existsSync(filePath)) {
              utils.log.warn(`already exists ${file}`);
            } else {
              fsPath.writeFileSync(filePath, format(template, formatData));
              utils.log.info(`generated ${file}`);
            }
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    };

    const removeFeature = function () {
      return new Promise(async (resolve, reject) => {
        try {
          const command = this.options.stage ? `sls remove --stage ${this.options.stage}` :'sls remove';
          const featurePath = `${this.cwd}${path.sep}src${path.sep}${this.options.name}`.toLowerCase();
          const slsFeaturePath = `${this.cwd}${path.sep}src${path.sep}${this.options.name}${path.sep}serverless.yml`.toLowerCase();
          if (!fs.existsSync(slsFeaturePath)) {
            utils.log.errorMessage(messages.FEATURE_FILE_NOT_EXISTS(slsFeaturePath));
            throw new Error(messages.FEATURE_FILE_NOT_EXISTS(slsFeaturePath));
          }
          utils.log.info(`Removing feature ${this.options.name}`);
          const options = {
            onData: (data) => {
              console.log(data);
            },
            onDone: (exitCode) => {
              if (exitCode !== 0) {
                utils.log.errorMessage(messages.ERROR_REMOVING_FEATURE);
                return;
              }
              rimraf(featurePath, (err) => {
                if (err) {
                  throw (err);
                }
                utils.log.info(messages.FEATURE_REMOVED(this.options.name));
                resolve();
              });
            },
            cwd: featurePath
          };
          await nrc.run(command, options);
        } catch (err) {
          reject(err);
        }
      });
    };

    if (this.options.remove && (this.options.remove !== 'true' && this.options.remove !== 'false')) {
      utils.log.errorMessage(messages.REMOVE_FLAG_USAGE);
      throw new Error(messages.REMOVE_FLAG_USAGE);
    }
    return this.options.remove && this.options.remove.toString() === 'true'
      ? removeFeature.call(this)
      : createFeatureFiles.call(this);
  }
}

module.exports = featureClass;
