'use strict';

const fs = require('fs');
const fsPath = require('fs-path');
const format = require('string-template');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.cwd = process.cwd();
    this.featureSet = [{
      name: 'functions',
      extension: 'yml',
      template: fs.readFileSync(`${__dirname}/templates/functions.temp.yml.txt`).toString()
    }, {
      name: 'handler',
      extension: 'js',
      template: fs.readFileSync(`${__dirname}/templates/handler.temp.js.txt`).toString()
    }, {
      name: 'controller',
      extension: 'js',
      template: fs.readFileSync(`${__dirname}/templates/controller.temp.js.txt`).toString()
    }, {
      name: 'model',
      extension: 'js',
      template: fs.readFileSync(`${__dirname}/templates/model.temp.js.txt`).toString()
    }];

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
          basepath: {
            usage:
              'Specify the basepath you want for your feature '
              + '(e.g. "--basepath \'users\'" or "-b \'users\'")',
            required: false,
            shortcut: 'b',
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
    return new Promise((resolve, reject) => {
      try {
        for (const i in this.featureSet) {
          const file = `${this.options.name}-${this.featureSet[i].name}.${this.featureSet[i].extension}`;
          const path = `${process.cwd()}/src/${this.options.name}/${file}`;
          const formatData = {
            feature: this.options.name,
            basepath: this.options.basepath || this.options.name
          };

          if (fs.existsSync(path)) {
            this.serverless.cli.log(`already exists ${file}`);
          } else {
            fsPath.writeFileSync(path, format(this.featureSet[i].template, formatData));
            this.serverless.cli.log(`generated ${file}`);
          }
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
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
