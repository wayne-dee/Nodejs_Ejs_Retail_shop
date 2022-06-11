const express = require('express');

const authController = require('../controllers/auth');
const User = require('../models/user')

const { check, body } = require('express-validator')

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login', 
    [
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail(),
        body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
    ],
    authController.postLogin);

router.post(
    '/signup', 
    [
        check('email')
            .isEmail()
            .withMessage('please enter valid email')
            .custom((value, {req}) => {
            //     if ( value === 'test@gmail.com') {
            //         throw new Error ('Th is email is forbidden')
            //     }
            //     return 
            // check email exist ahead of time in validation
            return User.findOne({email: value}).then(userDoc => {
                if (userDoc) {
                return Promise.reject(
                    'E-mail already exist, use another email'
                )
                }
                })
            }) 
            .normalizeEmail(),
        body(
            'password', 
            'please enter only text and numbers and minimum of 5 characters')
            .isLength({min: 5 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value.toString() !== req.body.password.toString()) {
                    throw new Error('Passwords have to match!');
                  }
                  return true;
                })
    ],
    authController.postSignup
    );

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;