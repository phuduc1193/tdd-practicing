'use strict';

var express     = require('express'),
    authRouter  = express.Router(),
    service     = require('../common/service'),
    db          = require('../common/db'),
    Auth        = require('../schema/auth'),
    User        = require('../schema/user'),
    jwtOptions  = require('../common/jwt-options'),
    jwt         = require('jsonwebtoken'),
    bcrypt      = require('bcrypt-nodejs');

authRouter.post('/login', function (req, res, next) {
  if(!req.body.username || !req.body.password){
    return res.status(401).json({
      response: {
        status: 40100,
        message: "missing login"
      }
    });
  }

  Auth.findOne({
    'username': req.body.username
  }, function (err, data) {
    if (err){
       return res.status(401).json({
        response: {
          status: 40101,
          message: "no username"
        }
      });
    }
    
    if (data == null || data.length == 0)
      return service.response(res, data);

    bcrypt.compare(req.body.password, data.password, function (err, isSuccess) {
      if (isSuccess) {
        // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
        var payload = service.jwtClaims(data._id);
        var token = jwt.sign(payload, jwtOptions.secretOrKey);
        return res.status(200).json({
          response: {
            status: 200,
            message: 'success'
          },
          data: {
            access_token: token,
            refresh_token: data.token
          }
        });
      } else {
        return res.status(401).json({
          response: {
            status: 40102,
            message: "wrong password"
          }
        });
      }
    });
  });
});

authRouter.post('/refresh', function(req, res, next) {
  if(!req.body.refresh_token && !req.body.sub){
    return res.status(400).json({
      response: {
        status: 40010,
        message: "missing information"
      }
    });
  }
  Auth.findOne({
    '_id': req.body.sub,
    'token': req.body.refresh_token
  }, function (err, data) {
    if (err){
       return res.status(401).json({
        response: {
          status: 40110,
          message: "bad credential"
        }
      });
    }

    if (data == null || data.length == 0)
      return service.response(res, data);

    var payload = service.jwtClaims(data._id);
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    return res.status(204).json({
      response: {
        status: 20410,
        message: 'token updated'
      },
      data: {
        access_token: token
      }
    });
  });
});

authRouter.post('/register', function (req, res, next) {
  bcrypt.hash(req.body.password, null, null, function (err, hash) {
    var user = new Auth({
      username: req.body.username,
      password: hash,
      token: service.guid()
    });
    user.save(function (err, data) {
      if (err) {
        if(err.name == 'ValidationError')
          return res.status(400).json({
             response: {
              status: 40000,
              message: 'username taken'
            }
          });
        return next();
      }
      var payload = service.jwtClaims(data._id);
      var token = jwt.sign(payload, jwtOptions.secretOrKey);
      return res.status(201).json({
        response: {
          status: 201,
          message: 'created'
        },
        data: {
          access_token: token,
          refresh_token: data.token
        }
      });
    });
  });
});

module.exports = authRouter;