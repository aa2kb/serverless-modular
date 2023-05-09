const removeCommands = {
  usage: 'Helps you remove in parallel or in sequence',
  lifecycleEvents: [
    'removeHandler'
  ],
  options: {
    'sm-parallel': {
      usage:
        'Specify if you want to remove parallel '
        + '(e.g. "--sm-parallel \'true\'")',
    },
    'sm-scope': {
      usage:
        'Specify if you want to remove local features or global '
        + '(e.g. "--sm-scope \'local\'")',
    },
    'sm-features': {
      usage:
        'Specify the local features you want to remove '
        + '(e.g. "--sm-feature \'users\'")',
    }
  }
};

module.exports = removeCommands;
