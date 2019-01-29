const fsPath = require('fs-path');
const path = require('path');
const fs = require('fs');
const format = require('string-template');
const _ = require('lodash');
const utils = require('../../utils');
const messages = require('../../messages');

class functionClass {
  createFunction() {
    return new Promise(async (resolve, reject) => {
      try {
        const esVersion = _.get(this.serverless, 'variables.service.custom.smConfig.esVersion', 'es5');
        const feature = this.options.feature;
        const name = this.options.name.toLowerCase();
        let HTTPMethod = this.options.method || 'get';
        HTTPMethod = HTTPMethod.toLowerCase();
        let HTTPPath = this.options.path || name;
        HTTPPath = HTTPPath.toLowerCase();
        const functionFilePath = `${this.cwd}${path.sep}src${path.sep}${feature}${path.sep}${feature}-functions.yml`;
        const handlerFilePath = `${this.cwd}${path.sep}src${path.sep}${feature}${path.sep}${feature}-handler.js`;
        if (!fs.existsSync(functionFilePath)) {
          utils.log.errorMessage(messages.FUNCTION_YML_NOT_EXISTS(functionFilePath, feature));
          throw new Error(messages.FUNCTION_YML_NOT_EXISTS(functionFilePath, feature));
        }
        if (!fs.existsSync(handlerFilePath)) {
          utils.log.errorMessage(messages.HANDLER_NOT_EXISTS(handlerFilePath, feature));
          throw new Error(messages.HANDLER_NOT_EXISTS(handlerFilePath, feature));
        }
        const functionsJson = await utils.ymlToJson(functionFilePath);
        for (const i in functionsJson.functions) {
          if (i.toLowerCase() === name) {
            utils.log.errorMessage(messages.FUNCTION_ALREADY_EXISTS(i.toLowerCase(), feature));
            throw new Error(messages.FUNCTION_ALREADY_EXISTS(i.toLowerCase(), feature));
          }
          for (const j in functionsJson.functions.events) {
            if (functionsJson.functions.events[j].http && functionsJson.functions.events[j].http.path.toLowerCase() === HTTPPath) {
              utils.log.errorMessage(messages.HTTP_PATH_ALREADY_EXISTS(HTTPPath, feature));
              throw new Error(messages.HTTP_PATH_ALREADY_EXISTS(HTTPPath, feature));
            }
          }
        }
        functionsJson.functions[name] = {
          handler: `${feature}-handler.${name}`,
          events: [{
            http: {
              method: `${HTTPMethod || 'GET'}`,
              path: `${HTTPPath || name}`,
              cors: true
            }
          }]
        };
        const FunctionsYml = utils.jsontoYml(functionsJson);
        fsPath.writeFileSync(functionFilePath, FunctionsYml);
        const formatData = {
          func_name: `${name}`
        };
        const newFunction = `\n${format(this.constants.templates.addFunction[esVersion], formatData)}\n`;
        fs.appendFileSync(handlerFilePath, newFunction);
        resolve();
        utils.log.info(`"${name}" function added in feature "${feature}"`);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = functionClass;
