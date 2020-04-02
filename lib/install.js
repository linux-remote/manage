const {successLog} = require('./util');
const { projectName } = require('./constant');
const installFn = require('./_install');
installFn();

successLog(`\n[${projectName}]: Install success.\n`);
