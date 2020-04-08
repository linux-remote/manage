const { getCachedVersionMap } = require('./util/version-map');
const { projectName } = require('./constant');
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

    let ssVersion = cachedVersionMap['session-store'];
    delete(cachedVersionMap['session-store']);
    cachedVersionMap['session-store'] = ssVersion; // set it below
    const arr = [];
    Object.keys(cachedVersionMap).forEach(name => {
      if(name[0] === '_'){
        return;
      }
      arr.push(`${name}: ${cachedVersionMap[name]}`);
    });
    console.log(`${projectName}: ${total}`);
    console.log(`cli: ${cliVersion}\tmanage: ${manageVersion}`);
    console.log(arr.join('\t'));

    // const msg2 = arr.join('\t');
    // const grayTypeNum = 90;
    // console.log('\u001b[' + grayTypeNum + 'm' + msg2 + '\u001b[39m');
  });
}
module.exports = getVersion;