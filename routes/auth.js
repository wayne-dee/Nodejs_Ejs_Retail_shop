const express = require('express');

const authController = require('../controllers/auth');

const { check, body } = require('express-validator')

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup', 
    check('email')
    .isEmail()
    .withMessage('please enter valid email')
    .custom((value, {req}) => {
        if ( value === 'test@gmail.com') {
            throw new Error ('This email is forbidden')
        }
        return true
    }),
    body(
        'password', 
        'please enter only text and numbers and minimum of 5 characters')
        .isLength({min: 5 })
        .isAlphanumeric(),
    body('confirm-password').custom((value, { req }) => {
        if (value !== req.body.password ) {
            throw new Error ('Password do not match')
        }
        return true
    }), 
    authController.postSignup
    );

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;