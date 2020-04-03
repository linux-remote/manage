
const { projectName,  homeDir } = require('./constant');
const { successLog, execSyncInherit } = require('./util/util.js');

function start(){
  execSyncInherit(`NODE_ENV=production ${process.argv[0]} ${homeDir}/index.js >>/dev/null 2>>/tmp/linux-remote-err.log &`, {
    cwd: homeDir
  });
  successLog(`\n${projectName} start success!\n`);
}

module.exports = start;
