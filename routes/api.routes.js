const express = require('express');
const router = express.Router();
const passport = require("passport");
const JWTStrategyPassportProvider = require('../classes/JWTStrategyPassportProvider');

passport.use(JWTStrategyPassportProvider.provide());

router.use(passport.initialize());

router.use('/auth', require('./JWTAuth.routes'));
router.use('/booking_process', require('./booking_process.routes'));

router.use('/', passport.authenticate('jwt', {session: false}));
router.use('/user_roles', require('./user_roles.routes'));
router.use('/processed_shipments', require('./processed_shipments.routes'));
router.use('/users', require('./users.routes'));

module.exports = router;