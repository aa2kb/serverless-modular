const fs = require('fs');

const Constants = {
  featureSet: [{
    name: 'functions',
    extension: 'yml',
    template: fs.readFileSync(`${__dirname}/templates/main/functions.temp.yml.txt`).toString()
  }, {
    name: 'handler',
    extension: 'js',
    template: {
      es5: fs.readFileSync(`${__dirname}/templates/main/handler.es5.temp.js.txt`).toString(),
      es6: fs.readFileSync(`${__dirname}/templates/main/handler.es6.temp.js.txt`).toString()
    }
  }, {
    name: 'controller',
    extension: 'js',
    template: {
      es5: fs.readFileSync(`${__dirname}/templates/main/controller.es5.temp.js.txt`).toString(),
      es6: fs.readFileSync(`${__dirname}/templates/main/controller.es6.temp.js.txt`).toString()
    }
  }, {
    name: 'model',
    extension: 'js',
    template: {
      es5: fs.readFileSync(`${__dirname}/templates/main/model.es5.temp.js.txt`).toString(),
      es6: fs.readFileSync(`${__dirname}/templates/main/model.es6.temp.js.txt`).toString(),
    }
  }],
  templates: {
    addFunction: {
      es5: fs.readFileSync(`${__dirname}/templates/components/newfunction.es5.handler.temp.txt`).toString(),
      es6: fs.readFileSync(`${__dirname}/templates/components/newfunction.es6.handler.temp.txt`).toString(),
    }
  }
};

module.exports = Constants;
