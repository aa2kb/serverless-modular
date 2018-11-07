const fsPath = require('fs-path');
const format = require('string-template');
const fs = require('fs');
const rimraf = require('rimraf');
const _ = require('lodash');
const utils = require('../../utils');

class featureClass {
  featureHandler() {
    const createFeatureFiles = function () {
      return new Promise(async (resolve, reject) => {
        try {
          const mainServerlessYmlPath = `${this.cwd}/serverless.yml`;
          const serverlessConfig = await utils.ymlToJson(mainServerlessYmlPath);
          const esVersion = utils.getEsVersion(serverlessConfig);
          const srcPath = `${this.cwd}/src`;
          const formatData = {
            feature: this.options.name,
            featureInitCap: _.startCase(this.options.name),
            basePath: this.options.basePath || this.options.name
          };
          const basePathExists = utils.checkIfBasePathIsInUse(srcPath, formatData.basePath);
          if (fs.existsSync(`${this.cwd}/src/${this.options.name}`)) {
            throw new Error(`Feature '${this.options.name}' Already exists`);
          }
          if (basePathExists) {
            throw new Error(`basePath '${formatData.basePath}' Already exists`);
          }
          for (const i in this.featureSet) {
            const file = `${this.options.name}-${this.featureSet[i].name}.${this.featureSet[i].extension}`.toLowerCase();
            const path = `${this.cwd}/src/${this.options.name}/${file}`.toLowerCase();
            let template;
            if (this.featureSet[i].name === 'controller' || this.featureSet[i].name === 'handler' || this.featureSet[i].name === 'model') {
              template = this.featureSet[i].template[esVersion];
            } else {
              template = this.featureSet[i].template;
            }
            if (fs.existsSync(path)) {
              this.serverless.cli.log(`already exists ${file}`);
            } else {
              fsPath.writeFileSync(path, format(template, formatData));
              this.serverless.cli.log(`generated ${file}`);
            }
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    };

    const removeFeature = function () {
      return new Promise((resolve, reject) => {
        try {
          const featurePath = `${this.cwd}/src/${this.options.name}`.toLowerCase();
          rimraf(featurePath, (err) => {
            if (err) {
              throw (err);
            }
            this.serverless.cli.log(`${this.options.name} feature removed`);
            resolve();
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    if (this.options.remove && (this.options.remove !== 'true' && this.options.remove !== 'false')) {
      throw new Error('Invalid use of remove flag\n\n only set to "--remove true or --remove false" while using this flag');
    }
    return this.options.remove && this.options.remove.toString() === 'true'
      ? removeFeature.call(this)
      : createFeatureFiles.call(this);
  }
}

module.exports = featureClass;
