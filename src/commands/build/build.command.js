
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
      type: 'string',
    },
    scope: {
      usage:
        'Specify the scope of the build, use this with "--feature" tag '
        + '(e.g. "--scope \'users\'" or "-s \'users\'")',
      required: false,
      shortcut: 's',
      type: 'string',
    }
  }
};

module.exports = buildCommands;
