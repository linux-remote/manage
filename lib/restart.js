// 改用 linux-remote stop linux-remote start
const {execSync} = require('child_process');

execSync(process.argv[0] + ' ./stop.js');

execSync(process.argv[0] + ' ./start.js');
