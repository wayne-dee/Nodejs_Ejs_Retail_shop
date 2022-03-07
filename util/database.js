const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient

let _db;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://onkeo:Douglous3@retailshopnode.cwxp1.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected!!');
            _db = client.db()
            callback()
        })
        .catch(err => {
            console.log(err)
    })
};

const getDB = () => {
    if(_db) {
        return _db
    }
    throw 'NO DATABASE FOUND'
}

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;