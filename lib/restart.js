// 改用 linux-remote stop linux-remote start
const stop = require('./stop');

function restart(){
  console.log('------restart------')
  stop(null, true);
}

module.exports = restart;
