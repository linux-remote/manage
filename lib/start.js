
"use strict";
const { projectName,  homeDir } = require('./constant');
const { successLog, errLog} = require('./util/util.js');
const { serverFilePath, confPath } = require('./util/paths.js');
const { getServerPid } = require('./util/ps-grep');
const fs = require('fs');
const {spawn} = require('child_process');

const conf = require(confPath);
const logPath = conf.log || '/dev/null';
const errorLogPath = conf.errLog || '/tmp/linux-remote-err.log';

let restartCallback;
function start(callback, oldPid){
  restartCallback = callback;
  if(restartCallback){
    _start(oldPid);
    return;
  }
  getServerPid(function(err, pid){
    if(err){
      console.error(err);
      return;
    }
    if(pid){
      console.log('pid', pid);
      errLog(`\n${projectName} already started!\n`)
    } else {
      _start();
    }
  });
}

let stdio;
if(process.env.NODE_ENV === 'development'){
  stdio = [ 'ignore', process.stdout, process.stderr ];
} else {
  const out = fs.openSync(logPath, 'a', 0o640);
  const err = fs.openSync(errorLogPath, 'a', 0o640);
  stdio = [ 'ignore', out, err ];
}

function _start(oldPid){
  // https://nodejs.org/api/child_process.html#child_process_options_detached
  // use detached to support web term restart. 
  const subprocess = spawn(process.argv[0], [serverFilePath], {
    env: { // reduce unnecessary copy
      NODE_ENV: process.env.NODE_ENV
    },
    detached: true,
    cwd: homeDir,
    stdio
  });
  subprocess.unref();

  function loop(count){
    if(count === 6){
      errLog(`\n${projectName} start timeout!\n`);
      // console.log('You can run directly:');
      // warnLog(`node ${homeDir}/index.js`);
      // console.log('To see what happened.');
      process.exit(1);
    }
    setTimeout(() => {
      getServerPid(function(err, pid){
        if(err){
          console.error(err);
          return;
        }
        if(!pid){
          loop(count + 1);
        } else {
          console.log('server pid ' + pid);
          console.log('log', logPath);
          console.log('err log', errorLogPath);
          successLog(`\n${projectName} start success!\n`);
          if(restartCallback){
            restartCallback(pid);
          }
        }
      }, oldPid);
    }, 500);
  }
  loop(0);
}

module.exports = start;
