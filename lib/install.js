const { execSync } = require('child_process');
const { homeDir, projectName } = require('./constant');

initPkg();
execSync('npm install', {
  cwd: homeDir
});

console.log(`\n[${projectName}]: Install success.\n`);
