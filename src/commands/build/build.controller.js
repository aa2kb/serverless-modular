const fsPath = require('fs-path');
const replace = require('replace-in-file');
const utils = require('../../utils');

class buildClass {
  async createFunctionsYml() {
    const feature = this.options.feature;
    const scope = this.options.scope;
    const srcPath = `${this.cwd}/src`;
    const mainFunctionsPath = `${this.cwd}/functions.yml`;
    const feautreServerlessYmlPath = `${this.cwd}/src/${feature}/serverless.yml`;
    const mainServerlessYmlPath = `${this.cwd}/serverless.yml`;
    let featureFunctions = [];
    if (scope && (scope !== 'local' && scope !== 'global')) {
      throw new Error('Invalid use of scope flag\n\n only set to "--scope local or --scope global" while using this flag');
    }
    if (feature) {
      featureFunctions = [{
        path: `${srcPath}/${feature}/${feature}-functions.yml`,
        name: feature
      }];
    } else {
      featureFunctions = utils.getFeaturePath(srcPath).map((f) => {
        const fSplit = f.split('/');
        const fName = fSplit[fSplit.length - 1];
        return {
          path: `${f}/${fName}-functions.yml`,
          name: fName
        };
      });
    }

    const mainFunctions = {};
    for (const f of featureFunctions) {
      const functionYml = await utils.ymltoJson(f.path);
      for (const i in functionYml.functions) {
        const currentFunction = functionYml.functions[i];
        currentFunction.handler = scope === 'local' ? currentFunction.handler : `src/${f.name}/${currentFunction.handler}`;
        for (const j in currentFunction.events) {
          const currentpath = currentFunction.events[j].http.path;
          currentFunction.events[j].http.path = scope === 'local' ? `${currentpath}` : `${functionYml.basepath}/${currentpath}`;
        }
        const functionName = scope === 'local' ? `${i}` : `${f.name}-${i}`;
        mainFunctions[functionName] = currentFunction;
      }
    }
    if (scope === 'local' && feature) {
      const serverlessConfig = await utils.ymltoJson(mainServerlessYmlPath);
      serverlessConfig.functions = mainFunctions;
      serverlessConfig.service = `${serverlessConfig.service}-${feature}`;
      if (serverlessConfig.package) {
        if (serverlessConfig.package.include) {
          serverlessConfig.package.include.push('../../node_modules');
        } else {
          serverlessConfig.package.include = ['../../node_modules'];
        }
      } else {
        serverlessConfig.package = {
          include: ['../../node_modules/**']
        };
      }
      fsPath.writeFileSync(feautreServerlessYmlPath, utils.jsontoYml(serverlessConfig));
      const options = {
        files: feautreServerlessYmlPath,
        from: [/\$\{file\(/g],
        to: '${file(../../',
      };
      await replace(options);
      this.serverless.cli.log(`local '${feature}' feature build successful`);
      this.serverless.cli.log(feautreServerlessYmlPath);
    } else if (scope === 'local' && !feature) {
      for (const f of featureFunctions) {
        let localFeautreServerlessYmlPath;
        const localFeatureFunctions = {};
        const functionYml = await utils.ymltoJson(f.path);
        for (const i in functionYml.functions) {
          const currentFunction = functionYml.functions[i];
          currentFunction.handler = scope === 'local' ? currentFunction.handler : `src/${f.name}/${currentFunction.handler}`;
          const functionName = scope === 'local' ? `${i}` : `${f.name}-${i}`;
          localFeatureFunctions[functionName] = currentFunction;

          const serverlessConfig = await utils.ymltoJson(mainServerlessYmlPath);
          serverlessConfig.functions = localFeatureFunctions;
          serverlessConfig.service = `${serverlessConfig.service}-${f.name}`;
          if (serverlessConfig.package) {
            if (serverlessConfig.package.include) {
              serverlessConfig.package.include.push('../../node_modules');
            } else {
              serverlessConfig.package.include = ['../../node_modules'];
            }
          } else {
            serverlessConfig.package = {
              include: ['../../node_modules/**']
            };
          }
          localFeautreServerlessYmlPath = `${this.cwd}/src/${f.name}/serverless.yml`;
          fsPath.writeFileSync(localFeautreServerlessYmlPath, utils.jsontoYml(serverlessConfig));
          const options = {
            files: localFeautreServerlessYmlPath,
            from: [/\$\{file\(/g],
            to: '${file(../../',
          };
          await replace(options);
        }
        console.log('\n');
        this.serverless.cli.log(`local '${f.name}' feature build successful`);
        this.serverless.cli.log(localFeautreServerlessYmlPath);
      }
    } else {
      fsPath.writeFileSync(mainFunctionsPath, utils.jsontoYml(mainFunctions));
      this.serverless.cli.log(`${feature ? `global '${feature}' feature ` : 'global '}build successful`);
      this.serverless.cli.log(mainFunctionsPath);
    }
  }
}

module.exports = buildClass;
