'use strict';

const constants = require('./constants');
const commands = require('./commands');
const SfFeatureController = require('./commands/sf-feature/sfFeature.controller');
const SfFunctionController = require('./commands/sf-function/sfFunction.controller');

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
      'sf-feature': commands.sfFeatureCommand,
      'sf-function': commands.sfFunctionCommand
    };
    this.hooks = {
      'sf-feature:createFeatureFile': sfFeatureController.createFeatureFile.bind(this),
      'sf-function:createFunction': sfFunctionController.createFunction.bind(this)
    };
  }
}

module.exports = ServerlessPlugin;
