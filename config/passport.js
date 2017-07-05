var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    function(req, email, password, done) {
      process.nextTick(function() {
        User.findOne({
          'local.email': email
        }, function(err, user) {
          if (err)
            return done(err);
          if (user) {
            return done(null, false, req.flash('signupMessage',
              'That email is already in use.'));
          } else {
            var newUser = new User();
            newUser.local.fname = req.body.fname;
            newUser.local.lname = req.body.lname;
            newUser.local.country = req.body.country;
            newUser.local.occupation = req.body.occupation;
            newUser.local.company = req.body.company;
            newUser.local.company = req.body.phone;
            newUser.local.structural = req.body.structural;
            newUser.local.civils = req.body.civils;
            newUser.local.electrical = req.body.electrical;
            newUser.local.plumbing = req.body.plumbing;
            newUser.local.carpentry = req.body.carpentry;
            newUser.local.roofing = req.body.roofing;
            newUser.local.flooring = req.body.flooring;
            newUser.local.shopfitting = req.body.shopfitting;
            newUser.local.doorswindows = req.body.doorswindows;
            newUser.local.network = req.body.network;
            newUser.local.hardware = req.body.hardware;
            newUser.local.telecom = req.body.telecom;
            newUser.local.biometrics = req.body.biometrics;
            newUser.local.airconditioning = req.body.airconditioning;
            newUser.local.software = req.body.software;
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(
              password);
            newUser.save(function(err) {
              if (err)
                throw err;
              console.log(newUser);
              return done(null, newUser);
            });
          }
        });
      });
    }));

  passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    function(req, email, password, done) {
      User.findOne({
        'local.email': email
      }, function(err, user) {
        if (err)
          return done(err);
        if (!user)
          return done(null, false, req.flash('loginMessage',
            'No user found.'));
        if (!user.validPassword(password))
          return done(null, false, req.flash('loginMessage',
            'Wrong password.'));
        return done(null, user);
      });
    }));
};
