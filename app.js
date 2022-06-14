const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user')

const MONGODB_URI = 'mongodb+srv://onkeo:Douglous3@retailshopnode.cwxp1.mongodb.net/shop';

const app = express();
const csrfProtection = csrf();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my secret word', 
  resave: false, 
  saveUninitialized: false,
  store: store
}));

app.use(csrfProtection);
// store validation messages
app.use(flash());


// CSRF middleware and login
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
  // isAuthenticated: req.session.isLoggedIn,
  // csrfToken: req.csrfToken,
})

// store user throughout the request
app.use((req, res, next) => {
  // throw in a syncronous code
  // throw new Error('Error occurred)
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      // for assync code
      next(new Error(err))
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500)

app.use(errorController.get404);

//error middleware
app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error Occurred',
    path: '/500',
  });
})
 
// connect to MongoDb
mongoose.connect(
  MONGODB_URI
)
  .then(resuslt => {
    console.log('connected to MongoDb database')
    app.listen(3000)
  })
  .catch(err => {
    console.log(err)
  });