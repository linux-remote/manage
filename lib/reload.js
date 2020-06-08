const { getServerMainPid } = require('./util/ps-grep');
const {successLog, execSyncInherit} = require('./util/util.js');
const { projectName } = require('./constant');
function reload(){
  getServerMainPid(function(err, pid){
    if(err){
      console.error(err);
      return;
    }
    if(pid){
      execSyncInherit('kill ' + pid);
      successLog(`${projectName} reloaed.`);
    } else {
      console.log(`${projectName} no server process runing.`);
    }
  })
}

module.exports = reload;

