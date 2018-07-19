const fs = require('fs');

const Constants = {
  featureSet: [{
    name: 'functions',
    extension: 'yml',
    template: fs.readFileSync(`${__dirname}/templates/main/functions.temp.yml.txt`).toString()
  }, {
    name: 'handler',
    extension: 'js',
    template: fs.readFileSync(`${__dirname}/templates/main/handler.temp.js.txt`).toString()
  }, {
    name: 'controller',
    extension: 'js',
    template: fs.readFileSync(`${__dirname}/templates/main/controller.temp.js.txt`).toString()
  }, {
    name: 'model',
    extension: 'js',
    template: fs.readFileSync(`${__dirname}/templates/main/model.temp.js.txt`).toString()
  }],
  templates: {
    addFunction: fs.readFileSync(`${__dirname}/templates/components/newfunction.handler.temp.txt`).toString()
  }
};

module.exports = Constants;
