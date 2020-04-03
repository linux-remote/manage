#!/usr/bin/env node

"use strict";
const { username } = require('./lib/constant');
const { warnLog, errLog } = require('./lib/util/util.js');
const os = require('os');

function manage(command){
  const userInfo = os.userInfo();
  if(userInfo.username !== username){
    warnLog(`You need run command as '${username}' user.`);
    return;
  }
  if(command === 'install'){

    require('./lib/install')();

  } else if(command === 'update'){

    require('./lib/update')();

  } else if(command === 'reload'){

    require('./lib/reload')();

  } else if(command === '-v'){

    require('./lib/version')();

  } else if(command === 'start'){

    require('./lib/start')();

  } else if(command === 'stop'){
    
    require('./lib/stop')();

  } else if(command === 'restart'){
    require('./lib/stop')();
  } else {
    errLog(`Unsupported command: '${command}'`);
  }
}
