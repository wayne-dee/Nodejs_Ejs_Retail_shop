const getDb = require('../util/database').getDb;

const mongodb = require('mongodb');
const onjectId = mongodb.ObjectId;

class User {
  constructor(userName, email, cart, id) {
    this.userName = name;
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
    const updatedCart = {itmes: [{...product, quantity: 1}]}
    const db = getDb();
      return db
      .collection('users')
      .updateOne({
      _id: new onjectId(this._id)}, 
      {$aet: {cart: updatedCart}
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
