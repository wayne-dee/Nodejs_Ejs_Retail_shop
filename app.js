const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user')

const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth')

const MONGODB_URI = 'mongodb+srv://onkeo:Douglous3@retailshopnode.cwxp1.mongodb.net/shop';

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpeg' || 
    file.mimetype === 'image/jpg' 
    ) {
        cb(null, true)
    }else {
      cb(null, false)
    }
}


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images'))); // serving images statically
app.use(session({
  secret: 'my secret word', 
  resave: false, 
  saveUninitialized: false,
  store: store
}));

// store validation messages
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next()
})


app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});


// to avoid check of csrf token for stripe route - stripe handles its security
app.post('/create-order', isAuth, shopController.postOrder);

app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// app.get('/500', errorController.get500);

app.use(errorController.get404);

 
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