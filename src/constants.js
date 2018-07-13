const fs = require('fs');

const Constants = {
  featureSet: [{
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
  }]
};

module.exports = Constants;
