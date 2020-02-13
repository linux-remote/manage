const { spawnSync, execSync } = require('child_process');
const { username } = require('./lib/constant');
const os = require('os');

const userInfo = os.userInfo();
if(userInfo.username !== username){
  warnLog(`You need run command '${command}' as '${username}' user.`);
  return;
}

const args = process.argv;
const nodeSh = args[0];
const command = args[2];
let params = args.slice(3);
params = params.length ? ' ' + params.join(' ') : '';
const cmd = `${nodeSh} ./lib/${command}.js${params}`;

const lrCmdMap = new Map([
  ['install', true],
  ['start', true],
  ['stop', true],
  ['restart', true],
  ['reload', true],
  ['update', true]
]);

if(lrCmdMap.has(command)){
  _execSync(cmd);
} else {
  errLog(`Unsupported command: ${command}`);
}

function  _execSync(cmd){
  console.log(cmd);
  execSync(cmd, {
    cwd: __dirname,
    stdio: 'inherit'
  });
}
