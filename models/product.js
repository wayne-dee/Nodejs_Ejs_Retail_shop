const mondoDb = require('mongodb'); 
const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, imageUrl, description) {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }

  save() {
    const db = getDb();
    return db
      .collection('products')
      .insertOne(this)
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }
  static fetchAll() {
    const db = getDb();
    return db
      .collection('products')
      .find()
      .toArray()
      .then(products => {
        console.log(products);
        return products
      })
      .catch(err => {
        console.log(err)
      })
  }
  static findById(prodId) {
    const db = getDb();
    return db
      .collection('products')
      .find({_id: new mondoDb.ObjectId(prodId)})
      .next()
      .then(product => {
        console.log(product);
        return product
      })
  }
}

module.exports = Product;
