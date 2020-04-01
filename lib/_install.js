const { execSync } = require('child_process');
const { homeDir } = require('./constant');
const { getFullMName, cacheClientVersion } = require('./util');
const conf = require(path.join(homeDir, './config.js'));

function install(){
  let deps = ['session-store', 'server', 'user-server'];
  let isHaveClient = false;
  
  if(typeof conf.client === 'object'){
    deps.push('client-mount');
    if(!conf.client.cdn){
      isHaveClient = true;
      deps.push('client');
    }
  }
  
  if(!isHaveClient){
   cacheClientVersion();
  }
  
  deps = deps.map(name => {
    return getFullMName(name) + '@latest';
  });
  
  execSync(`npm install ${deps.join(' ')} --save-exact`, {
    cwd: homeDir
  });
  return {
    isHaveClient,
    deps
  };
}

module.exports = install;

