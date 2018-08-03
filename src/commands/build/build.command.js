
const buildCommands = {
  usage: 'Helps you build out functions.yml file',
  lifecycleEvents: [
    'createFunctionsYml'
  ],
  options: {
    feature: {
      usage:
        'Specify the name of your existing feature '
        + '(e.g. "--feature \'users\'" or "-f \'users\'")',
      required: false,
      shortcut: 'f',
    }
  }
};

module.exports = buildCommands;
