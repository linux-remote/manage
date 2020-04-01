const {successLog} = require('./util');
const installFn = require('./_install');
installFn();

successLog(`\n[${projectName}]: Install success.\n`);
