const User = require('../models/user');
const bcrypt = require('bcryptjs');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const nodemailer = require('nodemailer');
const crypto = require('crypto')
const { validationResult } = require('express-validator')

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
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
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
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '', 
    },
    validationErrors: []
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
    bcrypt.hash(password, 12)
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
}


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({email: email})
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password',
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        })
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
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password',
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          })
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

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenDate = Date.now() + 3600000;
        return user.save()
    })
      .then(result => {
        res.redirect('/')
        const mailConfigurations = {
          from: 'douglasonkeo46@gmail.com',
          to: req.body.email,
          subject: 'Password Reset',
          html: `
          <p> You requested a password reset</p>
          <p> Click this link <a href="http://localhost:3000/reset/${token}">link</a> to set new password</p>
          `
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
}

// Craete new password

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  // extract from the view - ejs
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  // compare both resetToken, expiration date and userId
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
};
