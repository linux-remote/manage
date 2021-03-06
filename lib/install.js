
"use strict";
const path = require('path');
const { homeDir, projectName } = require('./constant');
const { getVersionMap, cacheVersionMap, initCacheMap, tipsCLI } = require('./util/version-map');
const { getFullMName,  execSyncInherit, successLog,  getDeps } = require('./util/util.js');
const {installStatic, isNeedStatic} = require('./util/handle-static');

const conf = require(path.join(homeDir, 'config.js'));

function install(cliVersion){

  getVersionMap(Object.create(null), function(err, newMap){
    if(err){
      console.error(err);
      return;
    }
    
    const deps = getDeps(conf);
    const needInstallArr = [];
    deps.forEach(name => {
      needInstallArr.push(getFullMName(name) + '@' + newMap[name]);
    });

    execSyncInherit(`npm install ${needInstallArr.join(' ')} --save-exact`, {
      cwd: homeDir
    });

    if(isNeedStatic(deps, conf)){
      installStatic();
    }
    
    const cacheMap = initCacheMap(deps, newMap);
    cacheVersionMap(cacheMap, function(err){
      if(err){
        console.error(err);
        return;
      }

      successLog(`\n${projectName} install success.\n`);
      if(newMap.cli !== cliVersion){
        tipsCLI(newMap.cli, cliVersion);
      }

    });
  });
}


module.exports = install;
