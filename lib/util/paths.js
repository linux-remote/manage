const path = require('path');
const { getFullMName } = require('./util.js');
const { homeDir } = require('../constant.js');

let serverFilePath,
  serverMainFilePath,
  serverUserFilePath,
  confPath;
if(process.env.NODE_ENV !== 'production'){
  serverFilePath = path.join(__dirname, '../../../server/src/index.js');
  serverMainFilePath = path.join(__dirname, '../../../server_main/src/index.js');
  serverUserFilePath = path.join(__dirname, '../../../server_user/src/index.js');
  confPath = path.join(__dirname, '../../../server/config-dev.js');
} else {
  const rrOpt = {
    paths: [path.join(homeDir, 'node_modules')]
  };
  serverFilePath = require.resolve(getFullMName('server'), rrOpt);
  serverMainFilePath = require.resolve(getFullMName('server_main'), rrOpt);
  serverUserFilePath = require.resolve(getFullMName('server_user'), rrOpt);
  confPath = path.join(homeDir, 'config.js');
}

module.exports = {
  serverFilePath,
  serverMainFilePath,
  serverUserFilePath,
  confPath
}