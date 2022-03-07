
const getDB = require('../util/database').getDB()

class Product {
  constructor(title, price, imageUrl, description) {
    this.title = title,
    this.price = price,
    this.imageUrl = imageUrl,
    this.description = description
  }

  save()
}

const Product = sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Product;