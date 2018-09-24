const featureCommands = {
  usage: 'Helps you build out your serverless feaure',
  lifecycleEvents: [
    'featureHandler'
  ],
  options: {
    name: {
      usage:
        'Specify the name you want for your feature '
        + '(e.g. "--name \'users\'" or "-m \'users\'")',
      required: true,
      shortcut: 'n',
    },
    remove: {
      usage:
        'set value to true if you want to remove the feature '
        + '(e.g. "--remove \'true\'" or "-r \'true\'")',
      required: false,
      shortcut: 'r',
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
