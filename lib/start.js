
"use strict";
const { projectName,  homeDir } = require('./constant');
const { successLog, errLog, execSyncInherit, warnLog } = require('./util/util.js');
const { getMainPid } = require('./util/ps-grep');
const errorLogPath = '/tmp/linux-remote-err.log';

function start(){
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
  
  execSyncInherit(`NODE_ENV=production ${process.argv[0]} ${homeDir}/index.js >>/dev/null 2>>${errorLogPath} &`, {
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
        }
      });
    }, 500);
  }
  loop(0);
}

module.exports = start;
