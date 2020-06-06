const { getCachedVersionMap } = require('./util/version-map');
function getVersion(cliVersion){
  getCachedVersionMap(function(err, cachedVersionMap){
    if(err){
      console.error(err);
      return;
    }
    
    const manageVersion = cachedVersionMap.manage;
    const total = cachedVersionMap._total;
    delete(cachedVersionMap.manage);
    delete(cachedVersionMap.cli);

    let ssVersion = cachedVersionMap['server'];
    delete(cachedVersionMap['server']);
    cachedVersionMap['server'] = ssVersion; // set it below
    const arr = [];
    Object.keys(cachedVersionMap).forEach(name => {
      if(name[0] === '_'){
        return;
      }
      arr.push(`${name}:${cachedVersionMap[name]}`);
    });
    console.log(total);
    
    const grayTypeNum = 90;
    let msg2 = `cli:${cliVersion} ` + arr.join(' ') + ` manage:${manageVersion}`;
    console.log('\u001b[' + grayTypeNum + 'm' + msg2 + '\u001b[39m');
    // msg2 = `cli:${cliVersion} manage:${manageVersion}`;
    // console.log('\u001b[' + grayTypeNum + 'm' + msg2 + '\u001b[39m');
  });
}
module.exports = getVersion;