
"use strict";
const { projectName,  homeDir } = require('./constant');
const { successLog, errLog, warnLog, execSyncInherit} = require('./util/util.js');
const { getMainPid } = require('./util/ps-grep');
const errorLogPath = '/tmp/linux-remote-err.log';
const logPath = '/dev/null';
let restartCallback;
function start(callback){
  restartCallback = callback;
  if(restartCallback){
    _start();
    return;
  }
  getMainPid(function(err, pid){
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

function _start(){

  execSyncInherit(`NODE_ENV=production ${process.argv[0]} ${homeDir}/index.js >>${logPath} 2>>${errorLogPath} &`, {
    cwd: homeDir
  });

  function loop(count){
    if(count === 6){
      errLog(`\n${projectName} start timeout!\n`);
      console.log('You can run directly:');
      warnLog(`NODE_ENV=production ${process.argv[0]} ${homeDir}/index.js`);
      console.log('To see what happened.');
      process.exit(1);
    }
    setTimeout(() => {
      getMainPid(function(err, pid){
        if(err){
          console.error(err);
          return;
        }
        if(!pid){
          loop(count + 1);
        } else {
          console.log('pid', pid);
          successLog(`\n${projectName} start success!\n`);
          if(restartCallback){
            restartCallback(pid);
          }
        }
      });
    }, 500);
  }
  loop(0);
}

module.exports = start;
