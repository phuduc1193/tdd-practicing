'user strict';

var passport    = require('passport'),
    passportJWT = require('passport-jwt'),
    JwtStrategy = passportJWT.Strategy,
    jwtOptions  = require('./jwt-options'),
    Auth        = require('../schema/auth');

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('Payload received: ', jwt_payload);
  Auth.findById(jwt_payload.sub, function(err, data) {
    if (err) {
      return next(err, false);
    }
    if (data) {
      if (Date.now() <= jwt_payload.exp)
        next(null, data);
      next(null, false);
    } else {
      next(null, false);
    }
  });
});

passport.use(strategy);

module.exports = passport;