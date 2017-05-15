const MongoClient = require("mongodb").MongoClient

var DB = {};
var databasePool = null;

DB.initPool = function initPool (callback) {
  MongoClient.connect(process.env.MONGODB_URI, function(error, db) {
    if (error) throw error;
    databasePool = db;
    callback(databasePool);
  })
};

DB.getInstance = function getInstance(callback) {
  if (databasePool) return callback(databasePool);
  DB.initPool(callback);
};

DB.findUser = function findUser(googleId, done) {
  DB.getInstance(function(db) {
    db.collection("users").findOne({ googleId: googleId }, done);
  });
};

module.exports = DB;
