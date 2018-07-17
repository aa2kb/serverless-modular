const jsYaml = require('js-yaml');
const jsonYml = require('json-to-pretty-yaml');
const fs = require('fs');

async function ymltoJson(filename) {
  return jsYaml.safeLoad(await fs.readFileAsync(filename, 'utf8').then(data => data));
}

function jsontoYml(jsonData) {
  return jsonYml.stringify(jsonData);
}


module.exports = {
  ymltoJson,
  jsontoYml
};
