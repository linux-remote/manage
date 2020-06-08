const path = require('path');
const { homeDir, projectName } = require('./constant');
const { diffVersionMap, cacheVersionMap, initCacheMap, tipsCLI } = require('./util/version-map');
const { getFullMName, execSyncInherit, successLog, warnLog, cyanLog, getDeps } = require('./util/util.js');
const {updateStatic, isNeedStatic} = require('./util/handle-static');
const conf = require(path.join(homeDir, 'config.js'));
let oldCLIVersionCache, newCLIVersionCache;
function update(cliVersion){
  const deps = getDeps(conf);
  diffVersionMap(deps, function(err, {oldMap, cacheMap, difMap, newMap}){
    if(err){
      console.error(err);
      return;
    }
    oldCLIVersionCache = cliVersion;
    newCLIVersionCache = newMap.cli;

    const difKeys = Object.keys(difMap);
    if(difKeys.length === 0){
      _end(true);
      return;
    }
    
    
    if(difMap['manage']){
      console.log('updating manage first...');
      const newManageVersion = difMap['manage'];
      _updateSelf(newManageVersion);
      cacheMap.manage = newManageVersion;
      cacheVersionMap(cacheMap, function(err){
        if(err){
          console.error(err);
          return;
        }
        successLog(`update manage ${oldMap['manage']} -> ${newManageVersion} success.`);
        console.log('reupdateing...');
        execSyncInherit(process.argv.join(' '));
      });
      return;
    }

    
    const needInstallArr = [];
    const afterCheckArr = [];
    deps.forEach(name => {
      if(difMap[name]){
        needInstallArr.push(getFullMName(name) + '@' + difMap[name]);
        afterCheckArr.push(name);
      }
    });
    if(needInstallArr.length){
      execSyncInherit(`npm install ${needInstallArr.join(' ')} --save-exact`, {
        cwd: homeDir
      });
      if(isNeedStatic(afterCheckArr, conf)){
        updateStatic();
      }
    }

    cacheVersionMap(initCacheMap(deps, newMap), function(err){
      if(err){
        console.error(err);
        return;
      }
      _end();
      if(difMap['client'] && (afterCheckArr.indexOf('client') === -1)){
        afterCheckArr.push('client');
      }
      _afterUpdate(afterCheckArr);
    });
  });
}

function _updateSelf(newVersion){
  execSyncInherit(`npm install ${getFullMName('manage')}@${newVersion} --save-exact`, {
    cwd: homeDir,
    stdio: 'inherit'
  });
}

function _end(isNoting){
  if(isNoting){
    successLog('\nNothing to update, Already the latest version.\n');
  } else {
    successLog(`\n${projectName} update success.\n`);
  }
  
  if(newCLIVersionCache !== oldCLIVersionCache){
    tipsCLI(newCLIVersionCache, oldCLIVersionCache);
  }
}


function _afterUpdate(afterCheckArr){
  

  const needCheckMap = {
    'server' : {
      restart: true
    },
    'server_main': {
      reload: true
    },
    'server_user': {
      reLogin: true
    },
    'client-mount': {
      reload: true,
      reloadBrowser: true
    },
    'client': {
      reload: true,
      reloadBrowser: true
    }
  }
  let isNeedStopStart = false;
  let isNeedReload = false;
  let isNeedRelogin = false;
  let isNeedReloadBrowser = false;

  let checkItem;
  afterCheckArr.forEach(name => {
    
    checkItem = needCheckMap[name];
    if(!checkItem){
      return;
    }
    if(!isNeedStopStart){
      isNeedStopStart = checkItem.restart;
    }

    if(!isNeedReload){
      isNeedReload = checkItem.reload;
    }
    if(!isNeedRelogin){
      isNeedRelogin = checkItem.reLogin;
    }

    if(!isNeedReloadBrowser){
      isNeedRelogin = checkItem.reloadBrowser;
    }
  });
  if(afterCheckArr.length === 0){
    return;
  }
  console.log('At next, You need:');

  if(isNeedStopStart){
    cyanLog('linux-remote restart');
    console.log('to apply updates.\n');
    warnLog('Waring: All logined user will lose session(logout).\n');
  
  } else if(isNeedReload){

    cyanLog('linux-remote reload');
    if(isNeedReloadBrowser){ // server side client-mount need both.
      console.log('\nand reload browser');
    }
    console.log('to apply updates.\n');

  } else if(isNeedRelogin){
    cyanLog('relogin to apply updates.\n');
  } else if(isNeedReloadBrowser){
    cyanLog('reload browser to apply updates.\n');
  } else {
    console.log('do nothing.');
  }
}



module.exports = update;
