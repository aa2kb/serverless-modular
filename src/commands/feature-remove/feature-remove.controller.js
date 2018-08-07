const rimraf = require('rimraf');

class featureRemoveClass {
  removeFeature() {
    return new Promise((resolve, reject) => {
      try {
        const featurePath = `${this.cwd}/src/${this.options.name}`;
        rimraf(featurePath, (err) => {
          if (err) {
            throw (err);
          }
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = featureRemoveClass;
