
const nrc = require('node-run-cmd');
const clui = require('clui');
const _ = require('lodash');
const logUpdate = require('log-update');
const utils = require('../../utils');

const slsSteps = [
  'Packaging service',
  'Excluding development dependencies',
  'Uploading CloudFormation file to S3',
  'Uploading artifacts',
  'Uploading service .zip file to S3',
  'Validating template',
  'Updating Stack',
  'Checking Stack update progress',
  'Stack update finished',
  'Service Information',
  'api keys:'
];
const Progress = clui.Progress;
const ProgressBar = new Progress(20);
let onStep = 0;
const multiStep = {};

function getCombinedLog(completedFeatureName, exitCode) {
  let combinedLogs = '';
  const isError = exitCode && exitCode !== 0;
  const isCompleted = completedFeatureName && !isError;
  for (const i in multiStep) {
    let stepText = multiStep[i] < 10 ? slsSteps[multiStep[i]] : 'Cleaning up';
    if (isCompleted) {
      stepText = 'Deployment Complete';
    }
    let finalLog = `${ProgressBar.update(multiStep[i] / 10)} ${stepText} (${i})`;
    if (isError) {
      finalLog = `❎  ${finalLog}`;
    } else if (isCompleted) {
      finalLog = `✅  ${finalLog}`;
    } else if (multiStep[i] >= 10) {
      finalLog = `🆗 ${finalLog}`;
    } else {
      finalLog = `⬆️  ${finalLog}`;
    }
    combinedLogs = `${combinedLogs}${finalLog}\n`;
  }
  return combinedLogs;
}

function deployProgress(data) {
  const stdOut = data;
  for (const i in slsSteps) {
    if (_.includes(stdOut, slsSteps[i])) {
      onStep = parseInt(i, 10);
      if (onStep === 9 || onStep === 10) {
        logUpdate(data);
        logUpdate.done();
      }
      break;
    }
  }
  logUpdate(`${onStep < 10 ? `${ProgressBar.update(onStep / 10)} ${slsSteps[onStep]}` : 'Deployment Complete'}`);
}

function deployMultiProgress(data) {
  const featurePath = this.cwd;
  const featureName = featurePath.split('/')[featurePath.split('/').length - 1];
  const stdOut = data;
  for (const i in slsSteps) {
    if (_.includes(stdOut, slsSteps[i])) {
      if (multiStep[featureName] !== 100 || multiStep[featureName] !== -1) {
        multiStep[featureName] = parseInt(i, 10);
      }
      break;
    }
  }
  logUpdate(getCombinedLog());
}

function deployDone() {
  // console.log('Deployment Complete');
}

function deployMultiDone(exitCode) {
  const featurePath = this.cwd;
  const featureName = featurePath.split('/')[featurePath.split('/').length - 1];
  logUpdate(getCombinedLog(featureName, exitCode));
}

async function globalDeploy(cwd, deployOpts) {
  try {
    const command = `sls deploy ${deployOpts} `;
    const options = {
      onData: deployProgress,
      onDone: deployDone,
      cwd
    };
    logUpdate(`${ProgressBar.update(0)} ${slsSteps[0]} `);
    await nrc.run(command, options);
  } catch (err) {
    throw (err);
  }
}

async function localDeploy(cwd, deployOpts, parallel, features) {
  const srcPath = `${cwd}/src`;
  const allFeatures = utils.getFeaturePath(srcPath, true, features);
  const slsCommands = [];
  const options = {};
  if (parallel) {
    options.mode = 'parallel';
  }
  for (const i in allFeatures) {
    const featureName = allFeatures[i].name;
    multiStep[featureName] = 0;
    slsCommands.push({
      command: `sls deploy ${deployOpts} `, cwd: allFeatures[i].path, onData: deployMultiProgress, onDone: deployMultiDone
    });
  }
  let combinedLogs = '';
  for (const i in multiStep) {
    const stepText = multiStep[i] < 10 ? slsSteps[multiStep[i]] : 'Deployment Complete';
    const finalLog = `⬆️  ${ProgressBar.update(multiStep[i] / 10)} ${stepText} (${i})`;
    combinedLogs = `${combinedLogs}${finalLog}\n`;
  }
  logUpdate(combinedLogs);
  await nrc.run(slsCommands, options);
}

module.exports = {
  globalDeploy,
  localDeploy
};
