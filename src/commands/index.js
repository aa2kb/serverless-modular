const smmFeatureAddCommand = require('./feature-add/feature-add.command');
const smmFeatureRemoveCommand = require('./feature-remove/feature-remove.command');
const smmFunctionCommand = require('./function/function.command');
const smmbuildCommand = require('./build/build.command');

const SmmFeatureAddController = require('./feature-add/feature-add.controller');
const SmmFeatureRemoveController = require('./feature-remove/feature-remove.controller');
const SmmFunctionController = require('./function/function.controller');
const SmmbuildController = require('./build/build.controller');

const smmFeatureAddController = new SmmFeatureAddController();
const smmFeatureRemoveController = new SmmFeatureRemoveController();
const smmFunctionController = new SmmFunctionController();
const smmbuildController = new SmmbuildController();

module.exports = {
  smmfeatureAdd: {
    command: smmFeatureAddCommand,
    controller: smmFeatureAddController.featureHandler
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
