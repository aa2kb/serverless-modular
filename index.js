'use strict';
let fs = require('fs');
var fsPath = require('fs-path');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.cwd = process.cwd();
    this.featureSet = [{
      name: 'functions',
      extension: 'yml'
    }, {
      name: 'handler',
      extension: 'js'
    }, {
      name: 'controller',
      extension: 'js'
    }, {
      name: 'model',
      extension: 'js'
    }]

    this.commands = {
      'sf-feature': {
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
        },
      },
      welcome: {
        usage: 'Helps you start your first Serverless plugin !',
        lifecycleEvents: [
          'hello',
          'world',
        ],
        options: {
          message: {
            usage:
              'Specify the message you want to deploy '
              + '(e.g. "--message \'My Message\'" or "-m \'My Message\'")',
            required: true,
            shortcut: 'm',
          },
        },
      },
    };

    this.hooks = {
      'before:welcome:hello': this.beforeWelcome.bind(this),
      'welcome:hello': this.welcomeUser.bind(this),
      'welcome:world': this.displayHelloMessage.bind(this),
      'after:welcome:world': this.afterHelloWorld.bind(this),
      'sf-feature:createFeatureFile': this.createFeatureFile.bind(this)
    };
  }

  createFeatureFile() {
    for (let i in this.featureSet) {
      const file = `${this.options.name}-${this.featureSet[i].name}.${this.featureSet[i].extension}`;
      const path = `${process.cwd()}/src/${this.options.name}/${file}`;
      if (fs.existsSync(path)) {
        this.serverless.cli.log(`already exists ${file}`);
      } else {
        fsPath.writeFileSync(path, '');
        this.serverless.cli.log(`generated ${file}`);
      }
    }
  }

  beforeWelcome() {
    this.serverless.cli.log('Hello from Serverless!');
  }

  welcomeUser() {
    this.serverless.cli.log('Your message:');
  }

  displayHelloMessage() {
    this.serverless.cli.log(`${this.options.message}`);
  }

  afterHelloWorld() {
    this.serverless.cli.log('Please come again!');
  }
}

module.exports = ServerlessPlugin;
