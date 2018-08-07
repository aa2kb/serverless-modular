const featureCommands = {
  usage: 'Helps you remove a feature from your project',
  lifecycleEvents: [
    'removeFeature'
  ],
  options: {
    name: {
      usage:
        'Specify the name of your feature you want to remove '
        + '(e.g. "--name \'users\'" or "-m \'users\'")',
      required: true,
      shortcut: 'n',
    }
  }
};

module.exports = featureCommands;
