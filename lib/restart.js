// 改用 linux-remote stop linux-remote start
const stop = require('./stop');
const start = require('./start');
function restart(){
  console.log('server restarting...');
  stop(function({pid, hasUser}){
    process.kill(pid, 'SIGHUP'); // kill server_main. free port to listen.
    // If not has server_user process(not pty), The server process will exit.
    console.log('stoped', pid);
    start(function(){
      console.log('server restart success');
      if(hasUser){ // kill old process. all user session destory.
        console.log('clear old porcess ' + pid);
        process.kill(pid);
      }
    }, pid);

  });
  
}
process.on('SIGHUP', function(){
  console.log('manage restart on SIGHUP')
})
module.exports = restart;
