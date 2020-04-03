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
  fs.writeFile(cachePath, JSON.stringify(map), callback);
}

function getVersionMap(oldMap, callback){
  
  let opt = Object.create(null);
  if(oldMap._etag){
    opt.headers = {
      'If-None-Match': oldMap._etag
    }
  }
  https.get(sourceUrl, opt, function(res){
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

function syncVersionMap(callback){
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

      Object.keys(oldMap).forEach(k => {
        if(oldMap[k] !== newMap[k]){
          difMap[k] = newMap[k];
        }
      });

      if(Object.keys(difMap).length){
        cacheVersionMap(newMap, function(err){
          if(err){
            return callback(err);
          }
          callback(null, reuslt);
        });
      } else {
        callback(null, reuslt);
      }
    });
  });
}

module.exports = {
  getCachedVersionMap,
  syncVersionMap,
  cacheVersionMap
}