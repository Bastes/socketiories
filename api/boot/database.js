const MongoClient = require("mongodb").MongoClient
const MONGODB_URL = "mongodb://localhost/skull"

var db = {};
var databasePool = null;

function initPool(callback) {
  MongoClient.connect(MONGODB_URL, function(error, db) {
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
