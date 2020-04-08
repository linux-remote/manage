"use strict";
const path = require('path');
const { execSyncInherit } = require('./util');
const {homeDir} = require('../constant');

function isNeedStatic(deps, conf){
  if(deps.indexOf('client-mount') !== -1 && !conf.client.cdn){
    return true;
  }
  return false;
}

function _installStatic(isUpdate){
  const clientMountPath = require.resolve('@linux-remote/client-mount', {
    paths: [path.join(homeDir, 'node_modules')]
  });
  const dir = path.dirname(clientMountPath);
  const staticMap = require(path.join(dir, 'static-map.json'));
  let arr = [];
  if(isUpdate){
    const installedDeps = require(path.join(homeDir, 'package.json')).dependencies;
  
    Object.keys(staticMap).forEach(name => {
      if(staticMap[name] !== installedDeps[name]){
        arr.push(name + '@' + staticMap[name]);
      }
    });
  } else {

    Object.keys(staticMap).forEach(name => {
      arr.push(name + '@' + staticMap[name]);
    });
    
  }

  if(arr.length){
    console.log('Install client static modules...');
    execSyncInherit(`npm install ${arr.join(' ')} --save-exact`, {
      cwd: homeDir
    });
  }
}

function installStatic(){
  _installStatic();
}

function updateStatic(){
  _installStatic(true);
}
module.exports = {
  isNeedStatic,
  installStatic,
  updateStatic
};
