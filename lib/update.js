const path = require('path');
const { homeDir, projectName } = require('./constant');
const { diffVersionMap, cacheVersionMap, initCacheMap } = require('./util/version-map');
const { getFullMName, execSyncInherit, successLog, warnLog, cyanLog, getDeps, tipsCLI } = require('./util/util.js');

const conf = require(path.join(homeDir, 'config.js'));
let oldCLIVersionCache, newCLIVersionCache;
function update(cliVersion){
  
  diffVersionMap(function(err, {oldMap, difMap, newMap}){
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
      const map = {
        ...oldMap,
        manage: newManageVersion
      }
      cacheVersionMap(map, function(err){
        if(err){
          console.error(err);
          return;
        }
        successLog(`update manage ${oldMap['manage']} -> ${newManageVersion} success.`);
        if(difKeys.length > 1){
          console.log('reupdateing...');
          execSyncInherit(process.argv.join(' '));
        } else {
          _end();
        }
      });
      return;
    }

    const deps = getDeps(conf);
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
      const cacheMap = initCacheMap(deps, newMap);
      cacheVersionMap(cacheMap, function(err){
        if(err){
          console.error(err);
          return;
        }
        _afterUpdate(afterCheckArr, oldMap, difMap);
      });
    } else {
      _end(true);
    }
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
    tipsCLI(newCLIVersionCache);
  }
}


function _afterUpdate(afterCheckArr, oldMap, difMap){
  const needCheckMap = {
    'session-store' : {
      restart: true
    },
    'server': {
      reload: true
    },
    'user-server': {
      reLogin: true
    },
    'client-mount': {
      reload: true,
      reloadBrowser: true
    },
    'client': {
      reloadBrowser: true
    }
  }
  let isNeedStopStart = false;
  let isNeedReload = false;
  let isNeedRelogin = false;
  let isNeedReloadBrowser = false;

  let checkItem;
  afterCheckArr.forEach(name => {
    console.log(`update ${name} ${oldMap[name]} -> ${difMap[name]} success.`);
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


  if(!isNeedReloadBrowser){
    if(typeof conf.client !== 'string'){
      // unCORS
      if(difMap['client']){
        isNeedReloadBrowser = true;
      }
    }
  }
  _end();

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
