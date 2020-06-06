"use strict";
const { exec } = require('child_process');
const { homeDir } = require('../constant');
const {  getFullMName } = require('./util');

const mainProcessMark = homeDir + '/index.js';
const serverProcessMark = getFullMName('server_main') + '/index.js';
const userServerProcessMark = getFullMName('server_user') + '/index.js';



function _getGrepInfo(cmd, endMark, callback){
  exec(`${cmd} | grep '${endMark}$'`, function(err, stdout, stderr){
    if(err){
      if(!stderr){
        return callback(null, ''); // no output will get an Error.
      }
      return callback(err);
    }
    callback(null, stdout.toString());
  })
}
function getPidByCMDMark(cmdMark, callback){
  _getGrepInfo('ps U linux-remote', cmdMark, function(err, stdout){
    if(err){
      return callback(err);
    }
    if(!stdout){
      return callback(null, '');
    }
    let pid = stdout.trim();
    if(pid){
      let i = pid.indexOf(' ');
      pid = pid.substr(0, i);
      return callback(null, pid);
    }
    callback(null, '');
  });
}

function getMainPid(callback){
  return getPidByCMDMark(mainProcessMark, callback);
}

function getServerPid(callback){
  return getPidByCMDMark(serverProcessMark, callback);
}

function getOnlineUser(callback){
  _getGrepInfo('w', userServerProcessMark, function(err, stdout){
    if(err){
      callback(err);
      return;
    }
    const result = stdout.trim();
    if(result){
      callback(null, result.split('\n'));
    } else {
      callback(null, []);
    }
    
  });
}

module.exports = {
  getOnlineUser,
  getMainPid,
  getServerPid
}
