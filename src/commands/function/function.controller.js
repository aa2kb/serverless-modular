const fsPath = require('fs-path');
const fs = require('fs');
const replace = require('replace-in-file');
const format = require('string-template');
const utils = require('../../utils');

class functionClass {
  createFunction() {
    return new Promise(async (resolve, reject) => {
      try {
        const feature = this.options.feature;
        const name = this.options.name;
        const functionFilePath = `${this.cwd}/src/${feature}/${feature}-functions.yml`;
        const handlerFilePath = `${this.cwd}/src/${feature}/${feature}-handler.js`;
        if (!fs.existsSync(functionFilePath)) {
          throw new Error(`ENOENT: no such file or directory, open '${functionFilePath}'\n\n Feature '${feature}-functions.yml' file does not exists`);
        }
        if (!fs.existsSync(handlerFilePath)) {
          throw new Error(`ENOENT: no such file or directory, open '${handlerFilePath}'\n\n Feature '${feature}-handler.js' file does not exists`);
        }
        const functionsJson = await utils.ymltoJson(functionFilePath);
        for (const i in functionsJson.functions) {
          if (i === name) {
            throw new Error(`Function "${name}" already exists in feature "${feature}"`);
          }
        }
        functionsJson.functions[name] = {
          handler: `src/${feature}/${feature}-handler.${name}`,
          events: [{
            http: {
              method: 'GET',
              path: `${name}`,
              cors: true
            }
          }]
        };
        const FunctionsYml = utils.jsontoYml(functionsJson);
        fsPath.writeFileSync(functionFilePath, FunctionsYml);

        const formatData = {
          func_name: `${name}`
        };
        await replace({
          files: handlerFilePath,
          from: '//sf-EOF',
          to: `${format(this.constants.templates.addFunction, formatData)}\n\n//sf-EOF`,
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = functionClass;
