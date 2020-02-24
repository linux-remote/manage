const { execSync } = require('child_process');
const { homeDir, projectName } = require('./constant');
const { getFullMName } = require('./util');
const conf = require(path.join(homeDir, './config.js'));

let deps = ['session-store', 'server', 'user-server'];
if(!conf.CORS){
  deps.push('client');
}
deps = deps.map(name => {
  return getFullMName(name) + '@latest';
});

execSync(`npm install ${deps.join(' ')} --save-exact`, {
  cwd: homeDir
});

console.log(`\n[${projectName}]: Install success.\n`);
