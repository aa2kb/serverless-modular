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
      type: 'string',
    },
    feature: {
      usage:
        'Specify the name of the existing feature  '
        + '(e.g. "--feature \'users\'" or "-f \'users\'")',
      required: true,
      shortcut: 'f',
      type: 'string',
    },
    path: {
      usage:
        'Specify the path for HTTP endpoint (API gateway)  '
        + '(e.g. "--path \'users\'" or "-p \'users\'")',
      required: false,
      shortcut: 'p',
      type: 'string',
    },
    method: {
      usage:
        'Specify the path for HTTP method (API gateway)  '
        + '(e.g. "--method \'GET\'" or "-m \'GET\'")',
      required: false,
      shortcut: 'm',
      type: 'string',
    }
  }
};

module.exports = functionCommands;
