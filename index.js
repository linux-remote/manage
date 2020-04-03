#!/usr/bin/env node

"use strict";
const { username } = require('./lib/constant');
const { warnLog, errLog } = require('./lib/util/util.js');
const os = require('os');

function manage(command, cliVersion){
  const userInfo = os.userInfo();
  if(userInfo.username !== username){
    errLog(`You are not user '${username}'.`);
    return;
  }
  if(command === 'install'){

    require('./lib/install')(cliVersion);

  } else if(command === 'update'){

    require('./lib/update')(cliVersion);

  } else if(command === 'reload'){

    require('./lib/reload')();

  }  else if(command === 'start'){

    require('./lib/start')();

  } else if(command === 'stop'){
    
    require('./lib/stop')();

  } else if(command === 'restart'){
    require('./lib/stop')();
  } else {
    errLog(`Unsupported command: '${command}'`);
  }
}

module.exports = manage;
