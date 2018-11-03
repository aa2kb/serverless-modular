const smmFeatureCommand = require('./feature/feature.command');
const smmFunctionCommand = require('./function/function.command');
const smmBuildCommand = require('./build/build.command');
const smmInitCommand = require('./init/init.command');

const SmmFeatureController = require('./feature/feature.controller');
const SmmFunctionController = require('./function/function.controller');
const SmmBuildController = require('./build/build.controller');
const SmmInitController = require('./init/init.controller');

const smmFeatureController = new SmmFeatureController();
const smmFunctionController = new SmmFunctionController();
const smmBuildController = new SmmBuildController();
const smmInitController = new SmmInitController();

module.exports = {
  smmFeature: {
    command: smmFeatureCommand,
    controller: smmFeatureController.featureHandler
  },
  smmFunction: {
    command: smmFunctionCommand,
    controller: smmFunctionController.createFunction
  },
  smmBuild: {
    command: smmBuildCommand,
    controller: smmBuildController.createFunctionsYml
  },
  smmInit: {
    command: smmInitCommand,
    controller: smmInitController.initHandler
  }
};
