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
    const baseCommand = {
      commands: {
        feature: commands.smmFeature.command,
        function: commands.smmFunction.command,
        build: commands.smmBuild.command,
        init: commands.smmInit.command
      }
    };
    this.commands = {
      modular: baseCommand,
      m: baseCommand
    };
    this.hooks = {
      'smm:feature:featureHandler': commands.smmFeature.controller.bind(this),
      'smm:function:createFunction': commands.smmFunction.controller.bind(this),
      'smm:build:createFunctionsYml': commands.smmBuild.controller.bind(this),
      'smm:init:initHandler': commands.smmInit.controller.bind(this),
    };
  }
}

module.exports = ServerlessPlugin;
