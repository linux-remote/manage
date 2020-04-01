const path = require('path');
const fs = require('fs');
const {execSync} = require('child_process');
const conf = require(path.join(homeDir, './config.js'));
const { homeDir, projectName } = require('./constant');
const { getFullMName, successLog, warnLog } = require('./util');
const installFn = require('./_install');
const pkgPath = homeDir + '/package.json';

const pkg = require(pkgPath);

const deps = pkg.dependencies;

let needCheckModules = [
  {
    name: 'session-store',
    type: 'reStart'
  },
  {
    name: 'server',
    type: 'reload'
  },
  {
    name: 'client-mount',
    type: 'reload'
  },
  {
    name: 'user-server',
    type: 'reLogin'
  },
  {
    name: 'client',
    type: 'reloadBrowser'
  }
];

const checkMap = Object.create(null);
needCheckModules.forEach(v => {
  checkMap[getFullMName(v.name)] = v;
})

// Update manage self: 
if(!process.env.LR_IS_NOT_UPDATE_SELF){
  const manageFullName = getFullMName('manage');
  const selfOldVersion = deps[manageFullName];
  execSync(`npm install ${manageFullName}@latest --save-exact`, {
    cwd: homeDir
  });
  const currselfVersion = _getDepVersion(manageFullName);
  
  if(selfOldVersion !== currselfVersion){
    console.log(`update manageFullName ${selfOldVersion} -> ${currselfVersion} success.`);
    console.log('Reupdating...');
    execSync(process.argv.join(' '), {
      env: {
        ...process.env,
        LR_IS_NOT_UPDATE_SELF = 1
      }
    });
    return;
  }
}

const result = installFn();



let isNeedStopStart = false;
let isNeedReload = false;
let isNeedRelogin = false;
let isNeedReloadBrowser = false;

let newPkg = fs.readFileSync(pkgPath, 'utf-8');
newPkg = JSON.parse(newPkg);
let newDeps = newPkg.dependencies;

if(!result.isHaveClient){
  const clientFullName = getFullMName('client');
  let oldClientVersion = pkgPath._lrClientVersionCache || deps[clientFullName];
  if(oldClientVersion !== newPkg._lrClientVersionCache){
    isNeedReloadBrowser = true;
  }
}
result.deps.forEach(fullName => {
  let newVersion = newDeps[fullName];
  let oldVersion = deps[fullName];
  if(newVersion !== oldVersion){
    console.log(`${fullName} ${oldVersion} -> ${newVersion} update success.`);
    const obj = checkMap[fullName];

    if(!isNeedStopStart){
      isNeedStopStart = obj.type === 'reStart'
    }
    if(!isNeedReload){
      isNeedReload = obj.type === 'reload'
    }
    if(!isNeedRelogin){
      isNeedRelogin = obj.type === 'reLogin'
    }
    if(!isNeedReloadBrowser){
      isNeedRelogin = obj.type === 'reloadBrowser'
    }
  }
});

successLog(`\n[${projectName}]: Update success.\n`);

console.log('At next, You need:');

if(isNeedStopStart){
  console.log('\nlinux-remote restart\n');
  console.log('to apply updates.');
  warnLog('Waring: All logined user will lose session(logout).\n');

} else if(isNeedReload){
  console.log('\nlinux-remote reload\n');
  console.log('to apply updates.\n');
} else if(isNeedRelogin){
  console.log('relogin to apply updates.\n');
} else if(isNeedReloadBrowser){
  console.log('reload browser to apply updates.\n');
}

function _getDepVersion(mName){
  let content = fs.readFileSync(pkgPath, 'utf-8');
  content = JSON.parse(content);
  return content.dependencies[mName];
}
