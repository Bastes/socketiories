const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;

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

DB.findUser = function findUser(id, done) {
  DB.getInstance(function(db) {
    db.collection("users").findOne({ "_id": new mongo.ObjectID(id) }, done);
  });
};

module.exports = DB;
