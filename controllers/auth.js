const User = require('../models/user');
const bcrypt = require('bcryptjs');
const mailchimp = require('@mailchimp/mailchimp_marketing');

const nodemailer = require('nodemailer');
const secure_configuration = require('../secure/secure.json');

const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
  //   Test user - email from google console
	type: 'OAuth2',
	user: secure_configuration.EMAIL_USERNAME,
	pass: secure_configuration.PASSWORD,
	clientId: secure_configuration.CLIENT_ID,
	clientSecret: secure_configuration.CLIENT_SECRET,
	refreshToken: secure_configuration.REFRESH_TOKEN
}
});


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

      const mailConfigurations = {
        from: 'douglasreeeeeeeonkeo46@gmail.com',
        to: email,
        subject: 'Rgistration Successful',
        text: 'Hello! Your account was registered successfully ' 
        + 'Welcome to the communit.'
      };
        
      transporter.sendMail(mailConfigurations, function(error, info){
        if (error) throw Error(error);
        console.log('Email Sent Successfully');
        console.log(info);
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

// RESET PASSWORD
exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};
