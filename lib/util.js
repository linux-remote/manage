const fs = require('fs');
const {exec, execSync} = require('child_process');

const { homeDir, username, projectName } = require('./constant');

function checkHomeDir(callback){
  fs.stat(homeDir, function(err){
    if(err){
      if(err.code === 'ENOENT'){
        return callback(null);
      }
      callback(err);
    }
    let _err = new Error(`Homedir '${homeDir}' already exist.`);
    _err.isExist = true;
    callback(_err)
  })
}

function checkUser(callback){
  exec(`cat /etc/passwd | grep '^${username}'`, function(err, stdout, stderr){
    if(err){
      if(!stderr){
        return callback(null); // no output will get an Error.
      }
      return callback(new Error(stderr));
    }
    if(stdout){
      let _err = new Error(`User '${username}' already exist.`);
      _err.isExist = true;
      return callback(_err);
    }
    callback(null);
  })
}

let _COLOR_MAP = {
  red: 31, 
  green: 32,
  yellow: 33, 
  cyan: 96
};
function _simpleColor(style, str) {
  return '\u001b[' + _COLOR_MAP[style] + 'm' + str + '\u001b[39m';
}
function successLog(str){
  console.log(_simpleColor('green', str));
}
function errLog(str){
  console.error(_simpleColor('red', str));
}
function warnLog(str){
  console.error(_simpleColor('yellow', str));
}

function getGlobalDir(){
  // let globalDir = execSync('npm root -g');
  globalDir = path.join(__dirname, '../');
  return globalDir;
}

function getFullMName(subName){
  return `@${projectName}/${subName}`;
}

// function getDir(moduleName){
//   var rPath = require.resolve(moduleName);
//   // cnpm: 
//   // C:\common\git\linux-remote\lr-public\node_modules\_xterm@3.12.2@xterm\lib\public\Terminal.js
//   // scope: C:\common\git\linux-remote\lr-public\node_modules\_@hezedu_winstrap@0.5.14@@hezedu\winstrap\index.js

//   var splitStr = 'node_modules' + path.sep;
//   var i = rPath.indexOf(splitStr)  + splitStr.length;
//   // var name = rPath.substr(i);
//   // name = name.substr(0, name.indexOf(path.sep));
//   var dir = rPath.substr(0, i);

  
//   var _subName = rPath.substr(i);
//   let subArr = _subName.split(path.sep);
//   if(moduleName.indexOf('/') !== -1){ // @hezedu/winstarp
//     _subName = subArr[0] + path.sep + subArr[1];
//   } else {
//     _subName = subArr[0];
//   }
//   return path.join(dir,  _subName);
// }

function viewClientVersionSync(){
  const clientFullName = getFullMName('client');
  const version = execSync(`npm view ${clientFullName} version`);
  return version.toString().trim();
}

function cacheClientVersion(){
  const clientVersion = viewClientVersionSync();
  const pkgPath = homeDir + '/package.json';
  let pkg = fs.readFileSync(pkgPath, 'utf-8');
  pkg = JSON.parse(pkg);
  const oldVersion = pkg._lrClientVersionCache;
  if(oldVersion !== clientVersion){
    pkg._lrClientVersionCache = clientVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, ' '));
    console.log(`client version ${clientVersion} cache success.`);
  }
  return clientVersion;
}

function cacheClientVersion(){
  const clientVersion = viewClientVersionSync();
  const pkgPath = homeDir + '/package.json';
  let pkg = fs.readFileSync(pkgPath, 'utf-8');
  pkg = JSON.parse(pkg);
  const oldVersion = pkg._lrClientVersionCache;
  if(oldVersion !== clientVersion){
    pkg._lrClientVersionCache = clientVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, ' '));
    if(!oldVersion){
      console.log(`Client version ${clientVersion} cache success.`);
    } else {
      console.log(`Client version ${oldVersion} -> ${clientVersion} cache success.`);
    }
  }
  return clientVersion;
}

module.exports = {
  getFullMName,
  checkHomeDir,
  checkUser,
  successLog,
  warnLog,
  errLog,
  getGlobalDir,
  viewClientVersionSync,
  cacheClientVersion
}