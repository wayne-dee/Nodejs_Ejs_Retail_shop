const getDb = require('../util/database').getDb;

const mongodb = require('mongodb');
const objectId = mongodb.ObjectId;

class User {
  constructor(userName, email, cart, id) {
    this.name = userName;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }
  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    // const cartProducts  = this.cart.items.findIndex(cp => {
    //   return cp._id === product._id;
    // })

    // // flying js addinng a field
    // product.quantity = 1
    // storing only the product id
    const updatedCart = {itmes: [{productId: new objectId(product._id), quantity: 1}]}
    const db = getDb();
      return db
      .collection('users')
      .updateOne({
      _id: new objectId(this._id)}, 
      {$set: {cart: updatedCart}
    })

  }

  static findById(userId) {
    const db = getDb();
    return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)}).then(user => {
      console.log(user);
      return user
    })
    .catch(err => {
      console.log(err)
    })
  }
}
module.exports = User;
