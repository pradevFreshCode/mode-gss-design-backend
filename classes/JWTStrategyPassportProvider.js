const passport = require("passport");
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const config = require(__dirname + '/../config/jwtOptions.json');
const User = require('../models/user.model');

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = config.secretKey;
jwtOptions.ignoreExpiration = false;

const JWTStrategyPassportProvider = {};

JWTStrategyPassportProvider.provide = function () {
    return new JwtStrategy(jwtOptions, function (jwt_payload, next) {
        User.findById(jwt_payload.user_id, (err, user) => {
            if (!!user) {
                next(null, user);
            } else {
                next(null, false);
            }
        });
    });
};

JWTStrategyPassportProvider.authorizeIfAuthHeaderExits = function(req, res, next){
    if (!!req.get('Authorization'))
        passport.authenticate('jwt', {session: false})(req, res, next);
    else next();
};

module.exports = JWTStrategyPassportProvider;

