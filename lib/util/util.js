"use strict";
const fs = require('fs');
const {exec, execSync} = require('child_process');

const { homeDir, username, projectName } = require('../constant');

function noop(){};

function checkHomeDir(callback){
  fs.stat(homeDir, function(err){
    if(err){
      if(err.code === 'ENOENT'){
        return callback(null);
      }
      callback(err);
    }
    let _err = new Error(`Homedir '${homeDir}' already exist.`);
    _err.isExist = true;
    callback(_err)
  })
}

function checkUser(callback){
  exec(`cat /etc/passwd | grep '^${username}'`, function(err, stdout, stderr){
    if(err){
      if(!stderr){
        return callback(null); // no output will get an Error.
      }
      return callback(new Error(stderr));
    }
    if(stdout){
      let _err = new Error(`User '${username}' already exist.`);
      _err.isExist = true;
      return callback(_err);
    }
    callback(null);
  })
}

let _COLOR_MAP = {
  red: 31, 
  green: 32,
  yellow: 33, 
  cyan: 96,
  // gray: 90
};
function simpleColor(style, str) {
  return '\u001b[' + _COLOR_MAP[style] + 'm' + str + '\u001b[39m';
}
function successLog(str){
  console.log(simpleColor('green', str));
}
function errLog(str){
  console.error(simpleColor('red', str));
}
function warnLog(str){
  console.error(simpleColor('yellow', str));
}
function cyanLog(str){
  console.error(simpleColor('cyan', str));
}


function getFullMName(subName){
  return `@${projectName}/${subName}`;
}

function getDeps(conf){
  let deps = ['session-store', 'server', 'user-server'];
  if(typeof conf.client === 'object'){
    deps.push('client-mount');
    if(!conf.client.cdn){
      deps.push('client');
    }
  }
  return deps;
}

function execSyncInherit(cmd, opt){
  opt = opt || Object.create(null);
  opt.stdio = 'inherit';
  opt.encoding = 'utf-8';
  console.log(cmd);
  return execSync(cmd, opt);
};



module.exports = {
  noop,
  getFullMName,
  checkHomeDir,
  checkUser,
  successLog,
  warnLog,
  errLog,
  execSyncInherit,
  getDeps,
  cyanLog,
  simpleColor
}