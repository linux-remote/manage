const { projectName } = require('./constant');
const {successLog, simpleColor} = require('./util/util.js');
const {getOnlineUser, getMainPid } = require('./util/ps-grep');

let restartCallback;
function stop(callback){
  restartCallback = callback;
  getOnlineUser(function(err, users){
    if(err){
      console.error(err);
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
          _killSessionStoreProcess(true);
        }
        process.stdin.end();
      }
    });

  });

  function _killSessionStoreProcess(hasUser){
    getMainPid(function(err, pid){
      if(err){
        console.error(err);
        return;
      }
      if(pid){
        if(restartCallback){
          restartCallback({
            pid,
            hasUser
          });
          return;
        } else {
          process.kill(pid);
          successLog(`\n${projectName} Stop success.\n`);
        }
        
      } else {
        console.log(`${projectName} no process runing.`);
      }
    });
  }

}



module.exports = stop;
