const fsPath = require('fs-path');
const utils = require('../../utils');

class buildClass {
  async createFunctionsYml() {
    const feature = this.options.feature;
    const srcPath = `${this.cwd}/src`;
    const mainFunctionsPath = `${this.cwd}/functions.yml`;
    let featureFunctions = [];
    if (feature) {
      featureFunctions = [{
        path: `${srcPath}/${feature}/${feature}-functions.yml`,
        name: feature
      }];
    } else {
      featureFunctions = utils.getFeaturePath(srcPath).map((f) => {
        const fSplit = f.split('/');
        const fName = fSplit[fSplit.length - 1];
        return {
          path: `${f}/${fName}-functions.yml`,
          name: fName
        };
      });
    }

    const mainFunctions = {};
    for (const f of featureFunctions) {
      const functionYml = await utils.ymltoJson(f.path);
      for (const i in functionYml.functions) {
        const currentFunction = functionYml.functions[i];
        for (const j in currentFunction.events) {
          const currentpath = currentFunction.events[j].http.path;
          currentFunction.events[j].http.path = `${functionYml.basepath}/${currentpath}`;
        }
        mainFunctions[`${f.name}-${i}`] = currentFunction;
      }
    }
    // console.log(mainFunctions);
    fsPath.writeFileSync(mainFunctionsPath, utils.jsontoYml(mainFunctions));
    this.serverless.cli.log(`${feature ? `'${feature}' feature ` : ''}Build Successful`);
  }
}

module.exports = buildClass;
