const Sequelize = require('sequelize');

// database name, username , password and options
const sequelize = new Sequelize('node-complete', 'root', 'Douglous3', {
    dialect: 'mysql',
    host: 'localhost',
});

module.exports = sequelize;