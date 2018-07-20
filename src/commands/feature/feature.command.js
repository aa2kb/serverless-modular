const featureCommands = {
  usage: 'Helps you build out your serverless feaure',
  lifecycleEvents: [
    'createFeatureFile'
  ],
  options: {
    name: {
      usage:
        'Specify the name you want for your feature '
        + '(e.g. "--name \'users\'" or "-m \'users\'")',
      required: true,
      shortcut: 'n',
    },
    basepath: {
      usage:
        'Specify the basepath you want for your feature '
        + '(e.g. "--basepath \'users\'" or "-b \'users\'")',
      required: false,
      shortcut: 'b',
    }
  }
};

module.exports = featureCommands;
