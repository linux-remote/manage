const { getCachedVersionMap } = require('./util/version-map');

function getVersion(cliVersion){
  getCachedVersionMap(function(err, cachedVersionMap){
    if(err){
      console.error(err);
      return;
    }
    
    const manageVersion = cachedVersionMap.manage;
    delete(cachedVersionMap._etag);
    delete(cachedVersionMap.manage);
    delete(cachedVersionMap.cli);

    let ssVersion = cachedVersionMap['session-store'];
    delete(cachedVersionMap['session-store']);
    cachedVersionMap['session-store'] = ssVersion; // set it below
    const arr = [];
    Object.keys(cachedVersionMap).forEach(name => {
      arr.push(`${name}: ${cachedVersionMap[name]}`);
    });
    console.log(arr.join('\t'));
    const msg2 = `manage: ${manageVersion}\tCLI: ${cliVersion}`;
    const grayTypeNum = 90;
    console.log('\u001b[' + grayTypeNum + 'm' + msg2 + '\u001b[39m');
  });
}
module.exports = getVersion;