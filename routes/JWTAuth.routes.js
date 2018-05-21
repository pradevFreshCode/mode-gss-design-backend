const express = require('express');
const router = express.Router();

const _ = require("lodash");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const jwtConfig = require(__dirname + '/../config/jwtOptions.json');

const JWTStrategyPassportProvider = require('../classes/JWTStrategyPassportProvider');

const validate = require('express-validation');
const registerValidation = require('../validation/register.validation');
const User = require('../models/user.model');
const UserRole = require('../models/user-role.model');

passport.use(JWTStrategyPassportProvider.provide());

router.use(passport.initialize());
router.get('/me', passport.authenticate('jwt', {session: false}), function (req, res, next) {
    User.findById(req.user.id, (err, user) => {
        if (!user) {
            next(new Error('user not found'));
        } else {
            res.respondSuccess({user: user})
        }
    });
});

router.post('/register', validate(registerValidation), function (req, res, next) {
    let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        login: req.body.login,
        email: req.body.email,
        phone: req.body.phone,
        role: UserRole.STATIC_IDS.USER_ROLE_ID
    });

    newUser.setPassword(req.body.password);

    newUser.save().then(user => {
        res.respondSuccess({token: makeTokenFromUser(user)});
    }).catch(err => {
        next(err);
    });
});

router.post('/signin', function (req, res, next) {
    let login = req.body.login;
    let password = req.body.password;

    signInAndReturnToken(login,password).then(token=>{
        res.respondSuccess({token: token});
    },err=>{
        res.sendWithCode(err, 401, 'error');
    });
});

router.post('/signout', function (req, res, next) {
    res.respondSuccess();
});

router.post('/refresh', passport.authenticate('jwt', {session: false}), function (req, res, next) {
    let user = req.user;

    if (!user)
        res.sendWithCode('user can\'t be parsed from token', 401, 'error');
    else {
        res.respondSuccess({token: makeTokenFromUser(user)});
    }
});

const signInAndReturnToken = function(login,password){
    return new Promise((resolve,reject)=>{
        User.findOne({
            login: login
        }).exec().then(user => {
            if (!user){
                reject('user not found');
            } else {
                if (user.compareHash(password)) {
                    resolve(makeTokenFromUser(user));
                } else {
                    reject('wrong passpord');
                }
            }
        });
    });
};

const makeTokenFromUser = function(user){
    let payload = {
        user_id: user._id
    };
    return jwt.sign(payload, jwtConfig.secretKey, { expiresIn: '60m' });
};

module.exports = router;