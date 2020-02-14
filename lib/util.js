const fs = require('fs');
const {exec, execSync} = require('child_process');

const { homeDir, username, projectName } = require('./constant');
const conf = require(path.join(homeDir, './config.js'));
const pkg = require(path.join(homeDir, './package.json'));
const fs = require('fs');

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
function simpleColor(style, str) {
  return '\u001b[' + _COLOR_MAP[style] + 'm' + str + '\u001b[39m';
}
function successLog(str){
  console.log(simpleColor('green', str));
}


function getGlobalDir(){
  // let globalDir = execSync('npm root -g');
  globalDir = path.join(__dirname, '../');
  return globalDir;
}

function getFullMName(subName){
  return `@${projectName}/${subName}`;
}

function initPkg(){
  if(!conf.CORS){
    let clientFullMName = getFullMName('client');
    if(!pkg.dependencies[clientFullMName]){
      pkg.dependencies[clientFullMName] = 'latest';
      fs.writeFileSync(path.join(homeDir, './package.json'), JSON.stringify(pkg, null, ' '));
    }
  }
  return conf.CORS;
}

function getDir(moduleName){
  var rPath = require.resolve(moduleName);
  // cnpm: 
  // C:\common\git\linux-remote\lr-public\node_modules\_xterm@3.12.2@xterm\lib\public\Terminal.js
  // scope: C:\common\git\linux-remote\lr-public\node_modules\_@hezedu_winstrap@0.5.14@@hezedu\winstrap\index.js

  var splitStr = 'node_modules' + path.sep;
  var i = rPath.indexOf(splitStr)  + splitStr.length;
  // var name = rPath.substr(i);
  // name = name.substr(0, name.indexOf(path.sep));
  var dir = rPath.substr(0, i);

  
  var _subName = rPath.substr(i);
  let subArr = _subName.split(path.sep);
  if(moduleName.indexOf('/') !== -1){ // @hezedu/winstarp
    _subName = subArr[0] + path.sep + subArr[1];
  } else {
    _subName = subArr[0];
  }
  return path.join(dir,  _subName);
}

module.exports = {
  getFullMName,
  checkHomeDir,
  checkUser,
  simpleColor,
  successLog,
  getGlobalDir,
  initPkg,
  getDir
}