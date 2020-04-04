// 改用 linux-remote stop linux-remote start
const stop = require('./stop');
const start = require('./start');

function restart(){
  stop(function(err){
    if(!err){
      start();
    }
  });
}

module.exports = restart;
