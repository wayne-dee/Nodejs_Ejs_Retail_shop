const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const mailchimp = require('@mailchimp/mailchimp_marketing');

var userEmail = '';
var userPassword = '';

var transporter = nodemailer.createTransport(`smtps://${userEmail}:${userPassword}@smtp.gmail.com`);

// const transporter = nodemailer.createTransport(mailchimp({
//   auth: {
//     api_key: '880094f3d529e9f61d8c113afd3c2a98-us11'
//   }
// }))

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({email: email}).then(userDoc => {
    if (userDoc) {
      req.flash('error', 'Email already exist')
      res.redirect('/signup');
    }
    return bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {items: []}
      });
      return user.save()
    })
    .then(result => {
      res.redirect('/login');
      // send email
      // return transporter.sendMail({
      //   to: email,
      //   from: 'douglasonkeo3@gmail.com',
      //   subject: 'Register Successful',
      //   html: '<h1> you have successful signed up </h1>'
      // }); 
      // NEW
      var mailOptions = {
        from: userEmail,    // sender address
        to: email, // list of receivers
        subject: 'Demo-1', // Subject line
        text: 'Hello world from Node.js',       // plaintext body
        html: '<b>Hello world from Node.js</b>' // html body
    };
    
    // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
    })
      .catch(err => {
        console.log(err)
      })
  })
    .catch(err => {
      console.log(err)
    })
}


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email: email})
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password')
        return res.redirect('/login')
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            // if password match
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          // if password do not match
          req.flash('error', 'Invalid email or password')
          return res.redirect('/login')
      }).catch(err => {
        console.log(err)
        res.redirect('/login');
      })
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
