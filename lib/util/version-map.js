"use strict";
const https = require('https');
const path = require('path');
const { homeDir } = require('../constant');
const fs = require('fs');
const sourceUrl = 'https://linux-remote.org/version-map.json';
const cachePath = path.join(homeDir, '.version-map.json');

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
      callback(null, oldMap);
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
        // console.log('body', body, res.statusCode);
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

function diffVersionMap(callback){
  getCachedVersionMap(function(err, oldMap){
    if(err){
      return callback(err);
    }
    getVersionMap(oldMap, function(err, newMap){
      if(err){
        return callback(err);
      }
      let difMap = Object.create(null);
      let reuslt = {
        difMap,
        newMap,
        oldMap
      }
      if(oldMap === newMap){
        callback(null, reuslt);
        return;
      }
      Object.keys(newMap).forEach(k => {
        if(oldMap[k] !== newMap[k]){
          difMap[k] = newMap[k];
        }
      });
      callback(null, reuslt);
    });
  });
}

function initCacheMap(deps, newMap){
  const cacheMap = Object.create(null);
  Object.assign(cacheMap, newMap);
  // const cacheMap = {
  //   _etag: newMap._etag,
  //    _total
  //   cli: newMap.cli,
  //   manage: newMap.manage
  // }
  const keepedMap = {
    cli: true,
    manage: true
  }
  const depMap = Object.create(null);
  deps.forEach(name => {
    depMap[name] = newMap[name];
  });
  for(let i in cacheMap){
    if(!keepedMap[i] && i[0] !== '_' && !depMap[i]){
      delete(cacheMap[i]);
      cacheMap['_' + i] = newMap[i];
    }
  }
  return cacheMap;
}

function tipsCLI(newCLIVersion){
  console.log(`The cli new version ${newCLIVersion} was published, you can:`);
  console.log(`npm install @linux-remote/cli -g`);
  console.log('to get it(linux-remote user generally can\'t to execute the command).');
}

module.exports = {
  getCachedVersionMap,
  diffVersionMap,
  cacheVersionMap,
  getVersionMap,
  initCacheMap,
  tipsCLI
}