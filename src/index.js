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
        feature: commands.smFeature.command,
        function: commands.smFunction.command,
        build: commands.smBuild.command,
        init: commands.smInit.command
      }
    };
    this.commands = {
      modular: baseCommand,
      m: baseCommand
    };
    this.hooks = {
      // main commands
      'modular:feature:featureHandler': commands.smFeature.controller.bind(this),
      'modular:function:createFunction': commands.smFunction.controller.bind(this),
      'modular:build:createFunctionsYml': commands.smBuild.controller.bind(this),
      'modular:init:initHandler': commands.smInit.controller.bind(this),

      // alias commands
      'm:feature:featureHandler': commands.smFeature.controller.bind(this),
      'm:function:createFunction': commands.smFunction.controller.bind(this),
      'm:build:createFunctionsYml': commands.smBuild.controller.bind(this),
      'm:init:initHandler': commands.smInit.controller.bind(this),

    };
  }
}

module.exports = ServerlessPlugin;
