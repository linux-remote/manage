const path = require('path');
const { homeDir, projectName } = require('./constant');
const { syncVersionMap, cacheVersionMap } = require('./util/sync-version-map');
const { getFullMName, execSyncInherit, successLog, warnLog, tipsCLI } = require('./util/util.js');

const conf = require(path.join(homeDir, 'config.js'));

function update(){
  syncVersionMap(function(err, {oldMap, difMap}){
    if(err){
      console.error(err);
      return;
    }
    const difKeys = Object.keys(difMap);
    if(difKeys.length === 0){
      successLog('\nNothing to update, Already the latest version\n');
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
          console.error('cacheVersionMap Error');
          console.error(err);
          return;
        }
        console.log(`update manage ${oldMap['manage']} -> ${newManageVersion} success.`);
        if(difKeys.length > 1){
          execSyncInherit(process.argv.join(' ') + ' _re');
          // let argv = process.argv;
          // if(argv[argv.length - 1] !== '_re'){
          //   console.log('reupdateing...');
          //   execSyncInherit(process.argv.join(' ') + ' _re');
          // } else {
          //   console.error(' ')
          // }
        } else {
          _end();
        }
      });
      return;
    }

    const deps = getDeps(conf);
    const needInstallArr = [];
    deps.forEach(name => {
      if(difMap[name]){
        needInstallArr.push(getFullMName(name) + '@' + difMap[name]);
      }
    });

    execSyncInherit(`npm install ${needInstallArr.join(' ')} --save-exact`, {
      cwd: homeDir
    });

    _afterUpdate(oldMap, difMap);

  });
}

function _updateSelf(newVersion){
  execSyncInherit(`npm install ${getFullMName('manage')}@${newVersion} --save-exact`, {
    cwd: homeDir,
    stdio: 'inherit'
  });
}

function _end(){
  successLog(`\n${projectName} update success.\n`);
}


function _afterUpdate(oldMap, difMap){
  const needCheckMap = {
    'session-store' : {
      restart: true
    },
    'server': {
      reload: true
    },
    'client-mount': {
      reload: true,
      reloadBrowser: true
    },
    'user-server': {
      reLogin: true
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
  for(let i in difMap){
    console.log(`update ${i} ${oldMap[i]} -> ${difMap[i]} success.`);
    checkItem = needCheckMap[i];

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
  }

  if(!isNeedReloadBrowser){
    if(typeof conf.client !== 'string'){
      // un cors
      if(difMap['client']){
        isNeedReloadBrowser = true;
      }
    }
  }
  _end();

  if(difMap['cli']){
    tipsCLI();
  }
  
  console.log('At next, You need:');

  if(isNeedStopStart){
    console.log('\nlinux-remote restart\n');
    console.log('to apply updates.');
    warnLog('Waring: All logined user will lose session(logout).\n');
  
  } else if(isNeedReload){

    console.log('\nlinux-remote reload\n');
    if(isNeedReloadBrowser){ // server side client-mount need both.
      console.log('and reload browser');
    }
    console.log('to apply updates.\n');

  } else if(isNeedRelogin){
    console.log('relogin to apply updates.\n');
  } else if(isNeedReloadBrowser){
    console.log('reload browser to apply updates.\n');
  }
}


module.exports = update;
