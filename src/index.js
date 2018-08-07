'use strict';

const constants = require('./constants');
const commands = require('./commands');

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
          'feature-add': commands.smmfeatureAdd.command,
          'feature-remove': commands.smmfeatureRemove.command,
          function: commands.smmFunction.command,
          build: commands.smmBuild.command
        }
      }
    };
    this.hooks = {
      'smm:feature-add:createFeatureFile': commands.smmfeatureAdd.controller.bind(this),
      'smm:feature-remove:removeFeature': commands.smmfeatureRemove.controller.bind(this),
      'smm:function:createFunction': commands.smmFunction.controller.bind(this),
      'smm:build:createFunctionsYml': commands.smmBuild.controller.bind(this)
    };
  }
}

module.exports = ServerlessPlugin;
