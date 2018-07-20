const functionCommands = {
  usage: 'Helps you build out your serverless feaure',
  lifecycleEvents: [
    'createFunction'
  ],
  options: {
    name: {
      usage:
        'Specify the name you want for your function '
        + '(e.g. "--name \'login\'" or "-n \'login\'")',
      required: true,
      shortcut: 'n',
    },
    feature: {
      usage:
        'Specify the name of the existing feature  '
        + '(e.g. "--feature \'users\'" or "-f \'users\'")',
      required: true,
      shortcut: 'f',
    }
  }
};

module.exports = functionCommands;
