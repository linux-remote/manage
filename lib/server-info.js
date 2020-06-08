
const {getOnlineUser, getServerPid, getServerMainPid } = require('./util/ps-grep');
function serverInfo(){
  getServerPid(function(err, pid){
    if(err){
      console.error(err);
      return;
    }
    if(pid){
      console.log('Main pid: ' + pid);
      getServerMainPid(function(err, pid){
        if(err){
          console.error(err);
          return;
        }
        if(pid){
          console.log('Server pid: ' + pid);
          getOnlineUser(function(err, arr){
            if(err){
              console.error(err);
              return;
            }
            console.log('Logined users: ' + arr.length);
            arr.forEach(function(wStdout){
              console.log(wStdout.trim());
            });
          });
        }
      })
    }
  })
}

module.exports = serverInfo;
