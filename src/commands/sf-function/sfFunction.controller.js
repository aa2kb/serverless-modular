const fsPath = require('fs-path');
const utils = require('../../utils');

class sfFunction {
  createFunction() {
    return new Promise(async (resolve, reject) => {
      try {
        const functionFilePath = `${this.cwd}/src/${this.options.feature}/${this.options.feature}-functions.yml`;
        const handlerFilePath = `${this.cwd}/src/${this.options.feature}/${this.options.feature}-handler.js`;
        const functionsJson = await utils.ymltoJson(functionFilePath);
        functionsJson.functions[this.options.name] = {
          handler: `src/${this.options.feature}/${this.options.feature}-handler.${this.options.name}`,
          events: [{
            http: {
              method: 'GET',
              path: `${this.options.name}`,
              cors: true
            }
          }]
        };
        const FunctionsYml = utils.jsontoYml(functionsJson);
        fsPath.writeFileSync(functionFilePath, FunctionsYml);
        console.log(FunctionsYml);
        // resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = sfFunction;
