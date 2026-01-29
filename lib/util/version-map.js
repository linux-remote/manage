"use strict";
const https = require('https');
const path = require('path');
const { homeDir } = require('../constant');
const fs = require('fs');
const sourceUrl = 'https://linux-remote.github.io/linux-remote/version-map.json';
const cachePath = path.join(homeDir, '.version-map.json');
const {warnLog} = require('./util');
const keepedMap = {
  _etag: true,
  _total: true,
  cli: true,
  manage: true
}

function getCachedVersionMap(callback){
  fs.readFile(cachePath, 'utf-8', function(err, result){
    if(err){
      if(err.code === 'ENOENT'){
        callback(null, Object.create(null));
        return;
      }
      callback(err);
      return;
    }
    let data;
    try {
      data = JSON.parse(result);
    } catch(e){
      callback(e);
      return;
    }
    callback(null, data);
  })
}

function cacheVersionMap(map, callback){
  fs.writeFile(cachePath, JSON.stringify(map, null, ' '), callback);
}

function getVersionMap(oldMap, callback){

  let headers = {
    'Cache-Control': 'max-age=0'
  }
  if(oldMap._etag){
    headers['If-None-Match'] = oldMap._etag;
  }
  console.log('GET ' + sourceUrl);
  https.get(sourceUrl, {
    headers
  }, function(res){
    if(res.statusCode === 304){
      callback(null, _restoreMap(oldMap));
      return;
    } else if(res.statusCode !== 200){
      callback(new Error(`get version-map.json error: ${res.statusCode}`));
      return;
    }
    let body = '';
    res.on('data', (chunk) => {
      body = body + chunk;
    });
    res.on('end', () => {
      try {
        body = JSON.parse(body);
        // console.log(res.statusCode, body);
      } catch(e){
        callback(e);
        return;
      }
      body._etag = res.headers.etag;
      callback(null, body);
    });
  }).on('error', (e) => {
    callback(e);
  });
}

function diffVersionMap(deps, callback){
  getCachedVersionMap(function(err, cacheMap){
    if(err){
      return callback(err);
    }
    getVersionMap(cacheMap, function(err, newMap){
      if(err){
        return callback(err);
      }
      let difMap = Object.create(null);
      const oldMap = _restoreMap(cacheMap);
      let reuslt = {
        difMap,
        newMap,
        cacheMap,
        oldMap
      }
      // if(oldMap === newMap){
      //   callback(null, reuslt);
      //   return;
      // }
      Object.keys(newMap).forEach(k => {
        if(cacheMap[k] !== newMap[k]){
          // cacheMap may client is _client;
          // client undefined
          if(!cacheMap[k]){
            if(deps.indexOf(k) === -1){
              if(oldMap[k] === newMap[k]){
                return;
              }
            }
          }
          difMap[k] = newMap[k];
        }
      });
      callback(null, reuslt);
    });
  });
}

function _restoreMap(cacheMap){
  let _map = Object.create(null);
  Object.keys(cacheMap).forEach(mName => {
    let _mName = mName;
    if(!keepedMap[mName] && mName[0] === '_'){
      _mName = mName.substr(1);
    }
    _map[_mName] = cacheMap[mName];
  });
  return _map;
}

function initCacheMap(deps, newMap){
  const cacheMap = Object.create(null);
  // const cacheMap = {
  //   _etag: newMap._etag,
  //    _total
  //   cli: newMap.cli,
  //   manage: newMap.manage
  // }

  const depMap = Object.create(null);
  deps.forEach(name => {
    depMap[name] = newMap[name];
  });
  Object.keys(newMap).forEach(mName => {
    if(keepedMap[mName] || depMap[mName]){
      cacheMap[mName] = newMap[mName];
    } else {
      cacheMap['_' + mName] = newMap[mName];
    }
  });
  return cacheMap;
}

function tipsCLI(newCLIVersion, oldVersion){
  if(_getMinorV(newCLIVersion) >= _getMinorV(oldVersion)){
    return;
  }
  console.log(`The cli new minor version ${newCLIVersion} was published, you can:`);
  warnLog(`\nnpm install linux-remote -g\n`);
  console.log('to get it(linux-remote user generally can\'t to execute the command).\n');
}



module.exports = {
  getCachedVersionMap,
  diffVersionMap,
  cacheVersionMap,
  getVersionMap,
  initCacheMap,
  tipsCLI
}


function _getMinorV(v){
  v = v.split('.');
  if(v.length > 2){
    v.splice(2);
  }
  return Number(v.join('.'));
}