const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const errorController = require('./controllers/error');
// const User = require('./models/user')


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res, next) => {
//   User.findById('6228fcdbc5f6b6d4b09cfb6f')
//     .then(user => {
//       req.user = new User(user.name, user.email, user.cart, user._id);
//       next();
//     })
//     .catch(err => console.log(err));
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// connect to MongoDb
mongoose.connect('mongodb+srv://onkeo:Douglous3@retailshopnode.cwxp1.mongodb.net/shop?retryWrites=true&w=majority')
  .then(resuslt => {
    console.log('connected to MongoDb database')
    app.listen(3000)
  })
  .catch(err => {
    console.log(err)
  });