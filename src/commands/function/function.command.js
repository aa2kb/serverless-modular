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
    },
    path: {
      usage:
        'Specify the path for HTTP endpoint (API gateway)  '
        + '(e.g. "--path \'users\'" or "-p \'users\'")',
      shortcut: 'p',
    },
    method: {
      usage:
        'Specify the path for HTTP method (API gateway)  '
        + '(e.g. "--method \'GET\'" or "-m \'GET\'")',
      shortcut: 'm',
    }
  }
};

module.exports = functionCommands;
