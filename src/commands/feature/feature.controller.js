const fsPath = require('fs-path');
const format = require('string-template');
const fs = require('fs');

class sfFeature {
  createFeatureFile() {
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
  }
}

module.exports = sfFeature;
