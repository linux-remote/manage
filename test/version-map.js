const {getVersionMap, getCacheVersionMap} = require('../lib/util/sync-version-map');

getCacheVersionMap(function(err, newMap){
  console.log(err);
});