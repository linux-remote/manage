#!/usr/bin/env node

"use strict";
const {homeDir, username } = require('./lib/constant.js');

if(!process.env.NODE_ENV){
  process.env.NODE_ENV = __dirname.indexOf(homeDir) === 0 ? 'production' : 'development';
}

const { errLog } = require('./lib/util/util.js');
const os = require('os');

function manage(command, cliVersion){
  if(command === '-v'){ // everybody
    require('./lib/version')(cliVersion);
    return;
  }
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

  } else if(command === 'serverinfo'){
    
    require('./lib/server-info')();

  } else if(command === 'restart'){
    require('./lib/restart')();
  } else {
    errLog(`Unsupported command: '${command}'`);
  }
}

module.exports = manage;
