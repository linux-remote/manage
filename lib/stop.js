const {execSync} = require('child_process');

const { projectName,  homeDir } = require('./constant');
const {successLog} = require('./util');
const mark = 'lr-user-server.js';
const mainProcessMark = homeDir = '/index.js';

let len = 0;
try {
  let result = execSync('w | grep ' + mark + '$');
  result = result.toString().trim();
  len = result.split('\n').length;
} catch(e){
  // console.error('result', e.message)
  // 0 user will Command failed.
 // Command failed;
}

if(len === 0){
  killSessionStoreProcess();
  return;
}

console.log(`\n[${projectName}]: ${len} users are logged in.`);
process.stdout.write('Do you want to forcefully destroy their session? [y/n]:');
process.stdin.setEncoding('utf-8');
process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    chunk = chunk.toLowerCase();
    chunk = chunk.trim();
    if (chunk === 'y') {
      killSessionStoreProcess();
    }
    process.stdin.end();
  }
});

function killSessionStoreProcess(){
  let stdout;
  try {
    stdout = execSync('ps U linux-remote | grep ' + sessionStoreMark + '$', {
      encoding: 'utf-8'
    });
  } catch (e){
    // no process will crash error.
  }

  if(stdout){
    let pid = stdout.trim();
    if(pid){
      let i = pid.indexOf(' ');
      pid = pid.substr(0, i);
      execSync('kill ' + pid);
      successLog(`\n[${projectName}]: Stop success.\n`);
    }
  }
}
