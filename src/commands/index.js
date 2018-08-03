const smmFeatureCommand = require('./feature/feature.command');
const smmFunctionCommand = require('./function/function.command');
const smmbuildCommand = require('./build/build.command');

const SmmFeatureController = require('./feature/feature.controller');
const SmmFunctionController = require('./function/function.controller');
const SmmbuildController = require('./build/build.controller');

const smmFeatureController = new SmmFeatureController();
const smmFunctionController = new SmmFunctionController();
const smmbuildController = new SmmbuildController();

module.exports = {
  smmFeature: {
    command: smmFeatureCommand,
    controller: smmFeatureController.createFeatureFile
  },
  smmFunction: {
    command: smmFunctionCommand,
    controller: smmFunctionController.createFunction
  },
  smmBuild: {
    command: smmbuildCommand,
    controller: smmbuildController.createFunctionsYml
  }
};
