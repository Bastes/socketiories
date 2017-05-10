const MongoClient = require("mongodb").MongoClient
module.exports = function (mongodb_url) {
  var db = {};
  var databasePool = null;

  function initPool(callback) {
    MongoClient.connect(mongodb_url, function(error, db) {
      if (error) throw error;
      databasePool = db;
      callback(databasePool);
    })
  };

  function getInstance(callback) {
    if (databasePool) return callback(databasePool);
    initPool(callback);
  };

  db.initPool = initPool;
  db.getInstance = getInstance;
  return db;
}
