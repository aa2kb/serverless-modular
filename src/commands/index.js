const smmFeatureCommand = require('./feature/feature.command');
const smmFunctionCommand = require('./function/function.command');
const SfFeatureController = require('./feature/feature.controller');
const SfFunctionController = require('./function/function.controller');

const sfFeatureController = new SfFeatureController();
const sfFunctionController = new SfFunctionController();

module.exports = {
  smmFeature: {
    command: smmFeatureCommand,
    controller: sfFeatureController.createFeatureFile
  },
  smmFunction: {
    command: smmFunctionCommand,
    controller: sfFunctionController.createFunction
  }
};
