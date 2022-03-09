const getDb = require('../util/database').getDb;

const mongodb = require('mongodb');
const onjectId = mongodb.ObjectId;

class User {
  constructor(userName, email) {
    this.userName = name;
    this.email = email;
  }
  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }
  static findById(userId) {
    const db = getDb();
    return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)})
  }
}
module.exports = User;
