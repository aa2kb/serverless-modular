const initHelper = require('./init.helper');

class initClass {
  initHandler() {
    return new Promise(async (resolve, reject) => {
      initHelper.updateGitignore(this.cwd);
      resolve();
    });
  }
}

module.exports = initClass;
