const { execSync } = require('child_process');
const { getFullMName } = require('./util/util.js');
const lrServerMark = getFullMName('server') + '/index.js';
let stdout
try {
  stdout = execSync('ps U linux-remote | grep ' + lrServerMark + '$');

} catch(e){
  // no process will crash error.
}

if(stdout){
  let pid = stdout.toString().trim();
  if(pid){
    let i = pid.indexOf(' ');
    pid = pid.substr(0, i);
    execSync('kill ' + pid);
    successLog(`\n[${projectName}]: Reload Success.\n`);
  }
}
