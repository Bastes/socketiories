const MongoClient = require("mongodb").MongoClient

var db = {};
var databasePool = null;

function initPool(callback) {
  MongoClient.connect(process.env.MONGODB_URI, function(error, db) {
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

module.exports = db;
