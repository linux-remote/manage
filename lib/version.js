const path = require('path');
const { getCachedVersionMap } = require('./util/sync-version-map');
const { getDeps } = require('./util/util.js');
const conf = require(path.join(homeDir, 'config.js'));

function getVersion(){
  getCachedVersionMap(function(err, versionMap){
    if(err){
      console.error(err);
      return;
    }
    const arr = getDeps(conf);
    arr.push('manage');
    arr.push('cli');
    arr.forEach(name => {
      console.log(`${name}: ${versionMap[name]}`);
    });
  });
}

module.exports = getVersion;