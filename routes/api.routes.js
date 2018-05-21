const express = require('express');
const router = express.Router();
const passport = require("passport");
const JWTStrategyPassportProvider = require('../classes/JWTStrategyPassportProvider');

passport.use(JWTStrategyPassportProvider.provide());

router.use(passport.initialize());

router.use('/auth', require('./JWTAuth.routes'));
router.use('/payment_process', require('./payment_process.routes'));

router.use('/', passport.authenticate('jwt', {session: false}));
router.use('/user_roles', require('./user_roles.routes'));
router.use('/users', require('./users.routes'));

module.exports = router;