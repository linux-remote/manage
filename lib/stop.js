const { projectName } = require('./constant');
const {successLog, simpleColor, execSyncInherit, noop} = require('./util/util.js');
const {getOnlineUser, getMainPid } = require('./util/ps-grep');


function stop(callback){
  callback = callback || noop;
  getOnlineUser(function(err, users){
    if(err){
      console.error(err);
      callback(err);
      return;
    }
    if(!users.length){
      _killSessionStoreProcess();
      return;
    }

    console.log(`\n${projectName}: ${simpleColor('cyan', users.length)} users are logged in.`);
    process.stdout.write('Are you want to forcefully destroy their session? [y/n]:');
    process.stdin.setEncoding('utf-8');
    process.stdin.on('readable', function() {
      var chunk = process.stdin.read();
      if (chunk !== null) {
        chunk = chunk.toLowerCase();
        chunk = chunk.trim();
        if (chunk === 'y') {
          _killSessionStoreProcess();
        }
        process.stdin.end();
      }
    });

  });

  function _killSessionStoreProcess(){
    getMainPid(function(err, pid){
      if(err){
        console.error(err);
        callback(err);
        return;
      }
      if(pid){
        execSyncInherit('kill ' + pid);
        successLog(`\n${projectName} Stop success.\n`);
      } else {
        console.log(`${projectName} no process runing.`);
      }
      callback(null);
    });
  }

}



module.exports = stop;
