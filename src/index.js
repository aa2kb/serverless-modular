'use strict';

const constants = require('./constants');
const commands = require('./commands');
const SfFeatureController = require('./commands/feature/feature.controller');
const SfFunctionController = require('./commands/function/function.controller');

const sfFeatureController = new SfFeatureController();
const sfFunctionController = new SfFunctionController();
class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.constants = constants;
    this.cwd = process.cwd();
    this.featureSet = this.constants.featureSet;
    this.commands = {
      smm: {
        commands: {
          feature: commands.sfFeatureCommand,
          function: commands.sfFunctionCommand,
        }
      }
    };
    this.hooks = {
      'smm:feature:createFeatureFile': sfFeatureController.createFeatureFile.bind(this),
      'smm:function:createFunction': sfFunctionController.createFunction.bind(this)
    };
  }
}

module.exports = ServerlessPlugin;
