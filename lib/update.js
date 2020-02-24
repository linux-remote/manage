const path = require('path');
const fs = require('fs');
const {execSync} = require('child_process');
const conf = require(path.join(homeDir, './config.js'));
const { homeDir, projectName } = require('./constant');
const { getFullMName, initPkg, getDir } = require('./util');

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
    name: 'user-server',
    type: 'reLogin'
  }
];

 if(!conf.CORS){
  needCheckModules.push({
    name: 'client',
    type: 'reloadBrowser'
  });
 }

let needUpdatePkgs = [];
needCheckModules.forEach(obj => {
  let name = obj.name;
  obj.fullName = getFullMName(name);
  needUpdatePkgs.push(obj.fullName + '@latest');
  obj.oldVerison = _getDepVersion(obj.fullName);
});

// Update manage first: 
if(!process.env.LR_IS_UPDATE_SELF){
  const manageFullName = getFullMName('manage');
  const selfOldVersion = _getDepVersion(manageFullName);
  execSync(`npm install ${manageFullName}@latest --save-exact`, {
    cwd: homeDir
  });
  const currselfVersion = _getDepVersion(manageFullName);
  
  if(selfOldVersion !== currselfVersion){
    cmd = process.argv.join(' ');
    execSync(cmd, {
      cwd: homeDir,
      env: {
        LR_IS_UPDATE_SELF = 1
      }
    });
    return;
  }
}

// Update other: 
execSync('npm install ' + needUpdatePkgs.join(' ') + '  --save-exact', {
  cwd: homeDir
});
console.log(`\n[${projectName}]: Update success.`);

let isNeedStopStart = false;
let isNeedReload = false;
let isNeedRelogin = false;
let isNeedReloadBrowser = false;

needCheckModules.forEach(obj => {

  const currVersion = _getDepVersion(obj.fullName);
  if(currVersion !== obj.oldVerison){
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



let nextInfo = '';
if(isNeedStopStart){
  nextInfo = 'At next, You need: \nlinux-remote restart\nTo apply updates. Waring: All logged in users will crash and logout.\n';
} else if(isNeedReload){
  nextInfo = 'At next, You need: \nlinux-remote reload\nTo apply updates.\n';
}

console.log(nextInfo);


function _getDepVersion(mName){
  let mPath = getDir(mName);
  mPath = path.join(mPath, './package.json');
  let content = fs.readFileSync(mPath, 'utf-8');
  content = JSON.parse(content);
  return content.version;
}

/*
function updateGlobalCLI(){
  let installCmd = `npm install ${projectName} --global-style --no-bin-links --no-package-lock`;
  
  execSync(installCmd, {
    cwd: homeDir
  });

  let globalDir = path.join(__dirname, '../');
  let dir = path.resolve('linux-remote');
  dir = path.dirname(dir);

  execSync(`(rm-rf ./*) && (mv ${dir}/* ./)`, {
    cwd: globalDir
  });

  fs.unlinkSync(dir);

  console.log('Update global CLI success!');
}
*/
