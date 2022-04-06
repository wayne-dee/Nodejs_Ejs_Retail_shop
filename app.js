const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const errorController = require('./controllers/error');
const User = require('./models/user')


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('623b6769076a843fea2cba98')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
 
// connect to MongoDb
mongoose.connect('mongodb+srv://onkeo:Douglous3@retailshopnode.cwxp1.mongodb.net/shop?retryWrites=true&w=majority')
  .then(resuslt => {
    // creating the user
    User.findOne().then(user => {
      if(!user) {
        const user = new User({
          name: "Douglas",
          email: "dougl@haja.om",
          cart: {
            items: []
          }
        });
        user.save()
      }
    })
    console.log('connected to MongoDb database')
    app.listen(3000)
  })
  .catch(err => {
    console.log(err)
  });