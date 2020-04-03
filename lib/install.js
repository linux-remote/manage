
"use strict";
const path = require('path');
const { homeDir, projectName } = require('./constant');
const { syncVersionMap } = require('./util/sync-version-map');
const { getFullMName,  execSyncInherit, successLog, tipsCLI, getDeps } = require('./util/util.js');

const conf = require(path.join(homeDir, 'config.js'));

function install(){

  syncVersionMap(function(err, {newMap, difMap}){
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
    successLog(`\n${projectName} install success.\n`);
    if(difMap['cli']){
      tipsCLI();
    }
  });
}

module.exports = install;
