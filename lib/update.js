const path = require('path');
const fs = require('fs');
const {execSync} = require('child_process');
const { homeDir, projectName } = require('./constant');

function getDepVersion(mName){
  let mPath = require.resolve(mName);
  mPath = path.resolve(mPath, '../package.json');
  let content = fs.readFileSync(mPath, 'utf-8');
  content = JSON.parse(content);
  return content.version;
}

const needCheckModules = [
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
},

{
  name: 'client',
  type: 'reloadBrowser'
}];

needCheckModules.forEach(obj => {  
  let name = obj.name;
  obj.oldVerison = getDepVersion(name)
});

execSync('npm update', {
  cwd: homeDir
});
console.log(`\n[${projectName}]: Update success.`);

let isNeedStopStart = false;
let isNeedReload = false;
let isNeedRelogin = false;
let isNeedReloadBrowser = false;

needCheckModules.forEach(obj => {

  const currVersion = getDepVersion(name);
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

let nextInfo = '';
if(isNeedStopStart){
  nextInfo = 'At next, You need: \nlinux-remote restart\nTo apply updates. Waring: All logged in users will crash and logout.\n';
} else if(isNeedReload){
  nextInfo = 'At next, You need: \nlinux-remote reload\nTo apply updates.\n';
}

console.log(nextInfo);
