const nrc = require('node-run-cmd');
const clui = require('clui');
const path = require('path');
const _ = require('lodash');
const logUpdate = require('log-update');
const fs = require('fs');
const fsPath = require('fs-path');
const utils = require('../../utils');

const slsSteps = [
  'Removing service'
];
const featuresCompleted = {};
let exitCodeCombined = 0;
const Progress = clui.Progress;
const ProgressBar = new Progress(20);
let onStep = 0;
let onStatus;
const multiStep = {};
// let logsPath = '';
// let mainLogsPath = '';

function getCombinedLog(completedFeatureName, exitCode) {
  let combinedLogs = '';
  const isError = exitCode && exitCode !== 0;
  for (const i in multiStep) {
    if (completedFeatureName === i && !isError) {
      multiStep[i].status = 'done-complete';
    } else if (completedFeatureName === i && isError) {
      multiStep[i].status = 'done-error';
    }

    let stepText = multiStep[i].progress < 10 ? slsSteps[multiStep[i].progress] : 'Cleaning up';
    if (multiStep[i].status === 'done-complete') {
      stepText = 'Removal Complete';
    }
    let finalLog = `${ProgressBar.update(multiStep[i].progress / 10)} ${stepText} (${i})`;
    if (multiStep[i].status === 'done-error') {
      finalLog = `❎  ${finalLog}`;
    } else if (multiStep[i].status === 'done-complete') {
      finalLog = `✅  ${finalLog}`;
    } else if (multiStep[i].progress >= 10) {
      finalLog = `🆗 ${finalLog}`;
    } else {
      finalLog = `⬆️  ${finalLog}`;
    }
    combinedLogs = `${combinedLogs}${finalLog}\n`;
  }
  return combinedLogs;
}

function getCombinedLogMain() {
  let stepText = onStep < 10 ? slsSteps[onStep] : 'Cleaning up';
  if (onStatus === 'done-complete') {
    stepText = 'Removal Complete';
  }
  let finalLog = `${ProgressBar.update(onStep / 10)} ${stepText}`;
  if (onStatus === 'done-error') {
    finalLog = `❎  ${finalLog}`;
  } else if (onStatus === 'done-complete') {
    finalLog = `✅  ${finalLog}`;
  } else if (onStep >= 10) {
    finalLog = `🆗 ${finalLog}`;
  } else {
    finalLog = `⬆️  ${finalLog}`;
  }
  return `${finalLog}\n`;
}

function removeProgress(data) {
  const stdOut = data;
  const cwd = this.cwd;
  fs.appendFileSync(`${cwd}${path.sep}.sm.log`, data, { flag: 'a+' });
  for (const i in slsSteps) {
    if (_.includes(stdOut, slsSteps[i])) {
      onStep = parseInt(i, 10);
      break;
    }
  }
  logUpdate(`${getCombinedLogMain()}`);
}

function removeMultiProgress(data) {
  const featurePath = this.cwd;
  const featureName = featurePath.split(`${path.sep}`)[featurePath.split(`${path.sep}`).length - 1];
  const stdOut = data;
  fs.appendFileSync(`${featurePath}${path.sep}.sm.log`, data, { flag: 'a+' });
  for (const i in slsSteps) {
    if (_.includes(stdOut, slsSteps[i])) {
      if (!multiStep[featureName].status.includes('done-')) {
        multiStep[featureName].progress = parseInt(i, 10);
      }
      break;
    }
  }
  logUpdate(getCombinedLog());
}

function removeDone(exitCode) {
  if (exitCode !== 0) {
    onStatus = 'done-error';
  } else {
    onStatus = 'done-complete';
  }
  logUpdate(`${getCombinedLogMain()}`);
}

function removeMultiDone(exitCode) {
  const featurePath = this.cwd;
  const featureName = featurePath.split(`${path.sep}`)[featurePath.split(`${path.sep}`).length - 1];
  featuresCompleted[featureName] = parseInt(exitCode, 10) === 0 ? 'Success' : 'Error';
  exitCodeCombined += parseInt(exitCode, 10);
  logUpdate(getCombinedLog(featureName, exitCode));
}

async function globalRemove(cwd, removeOpts) {
  try {
    removeOpts = removeOpts || '';
    const command = `sls remove ${removeOpts} `;
    const options = {
      onData: removeProgress,
      onDone: removeDone,
      cwd
    };
    // mainLogsPath = `▶️  Logs: ${`${cwd}${path.sep}.sm.log`}`;
    fsPath.writeFileSync(`${cwd}${path.sep}.sm.log`, '');
    logUpdate(`⬆️  ${ProgressBar.update(0)} ${slsSteps[0]}\n`);
    await nrc.run(command, options);
  } catch (err) {
    throw (err);
  }
}

async function localRemove(cwd, removeOpts, parallel, features) {
  try {
    removeOpts = removeOpts || '';
    const srcPath = `${cwd}${path.sep}src`;
    const allFeatures = utils.getFeaturePath(srcPath, true, features);
    const slsCommands = [];
    const options = {};
    if (parallel) {
      options.mode = 'parallel';
    }
    console.log('SLS REMOVE COMMAND');
    console.log(`sls remove ${removeOpts} `);
    for (const i in allFeatures) {
      const featureName = allFeatures[i].name;
      const featureCwd = allFeatures[i].path;
      multiStep[featureName] = {
        status: 'in-progress',
        progress: 0
      };
      slsCommands.push({
        command: `sls remove ${removeOpts} `, cwd: featureCwd, onData: removeMultiProgress, onDone: removeMultiDone
      });
      fsPath.writeFileSync(`${featureCwd}${path.sep}.sm.log`, '');
      // logsPath += `▶️  ${featureName}: ${`${featureCwd}${path.sep}.sm.log`}\n`;
    }
    let combinedLogs = '';
    for (const i in multiStep) {
      const finalLog = `⬆️  ${ProgressBar.update(multiStep[i].progress / 10)} ${slsSteps[0]} (${i})`;
      combinedLogs = `${combinedLogs}${finalLog}\n`;
    }
    logUpdate(combinedLogs);
    await nrc.run(slsCommands, options);
    logUpdate(JSON.stringify(featuresCompleted, null, 2));
    if (exitCodeCombined > 0) {
      for (const i in allFeatures) {
        const featureName = allFeatures[i].name;
        const featureCwd = allFeatures[i].path;
        if (featuresCompleted[featureName] === 'Error') {
          console.log(`\n\n\n--- ERROR IN FEATURE ${featureName.toUpperCase()} ---\n\n\n`);
          const data = fs.readFileSync(`${featureCwd}${path.sep}.sm.log`);
          console.log(data.toString());
        }
      }
      throw new Error('Removal failed');
    }
  } catch (err) {
    throw (err);
  }
}

module.exports = {
  globalRemove,
  localRemove
};
