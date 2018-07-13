'use strict';

const constants = require('./constants');
const commands = require('./commands');
const SfFeatureController = require('./commands/sf-feature/sfFeature.controller');

const sfFeatureController = new SfFeatureController();
class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.constants = constants;
    this.cwd = process.cwd();
    this.featureSet = this.constants.featureSet;

    this.commands = {
      'sf-feature': commands.sfFeatureCommand
    };
    this.hooks = {
      'sf-feature:createFeatureFile': sfFeatureController.createFeatureFile.bind(this)
    };
  }
}

module.exports = ServerlessPlugin;
