const fsPath = require('fs-path');
const format = require('string-template');
const fs = require('fs');
const rimraf = require('rimraf');

class featureClass {
  featureHandler() {
    const createFeatureFiles = function () {
      return new Promise((resolve, reject) => {
        try {
          for (const i in this.featureSet) {
            const file = `${this.options.name}-${this.featureSet[i].name}.${this.featureSet[i].extension}`;
            const path = `${this.cwd}/src/${this.options.name}/${file}`;
            const formatData = {
              feature: this.options.name,
              basepath: this.options.basepath || this.options.name
            };

            if (fs.existsSync(path)) {
              this.serverless.cli.log(`already exists ${file}`);
            } else {
              fsPath.writeFileSync(path, format(this.featureSet[i].template, formatData));
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
          const featurePath = `${this.cwd}/src/${this.options.name}`;
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

    console.log(this.options.remove);
    return this.options.remove.toString() === 'true'
      ? removeFeature.call(this)
      : createFeatureFiles.call(this);
  }
}

module.exports = featureClass;
