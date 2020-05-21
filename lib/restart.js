// 改用 linux-remote stop linux-remote start
const stop = require('./stop');
const start = require('./start');
function restart(){
  
  stop(function({pid, hasUser}){
    process.kill(pid, 1); // kill main server. if not has user process will exit.
    start(function(){
      console.log('------restart success!------');
      if(hasUser){ // kill old process.
        process.kill(pid);
      }
    });
  });
  console.log('------restarting------');
}

module.exports = restart;
