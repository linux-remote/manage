"use strict";
const { exec } = require('child_process');

const {serverFilePath, serverMainFilePath, serverUserFilePath } = require('./paths.js');

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
function _getPidsByCMDMark(cmdMark, callback){
  _getGrepInfo('ps U linux-remote', cmdMark, function(err, stdout){
    if(err){
      return callback(err);
    }
    if(!stdout){
      return callback(null, []);
    }
    let arr = stdout.trim();
    if(!arr){
      return callback(null, []);
    }
    arr = stdout.split('\n');
    let result = [];
    arr.forEach((line) => {
      let pid = line.trim();
      if(pid){
        let i = pid.indexOf(' ');
        pid = pid.substr(0, i);
        result.push(pid);
      }
    });
    callback(null, result);
  });
}

function getServerPid(callback, oldPid){
  return _getPidsByCMDMark(serverFilePath, function(err, arr){
    if(err){
      return callback(err);
    }
    if(oldPid){
      let index = arr.indexOf(oldPid);
      if(index !== -1){
        arr.splice(index, 1);
      }
    }
    if(arr.length > 1){
      return callback(new Error('server process repeated.'));
    }
    callback(null, arr[0]);
  });
}

function getServerMainPid(callback){
  return _getPidsByCMDMark(serverMainFilePath, function(err, arr){
    if(err){
      return callback(err);
    }
    if(arr.length > 1){
      return callback(new Error('server_main process repeated.'));
    }
    callback(null, arr[0]);
  });
}

function getOnlineUser(callback){
  _getGrepInfo('w', serverUserFilePath, function(err, stdout){
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
  getServerPid,
  getServerMainPid
}
