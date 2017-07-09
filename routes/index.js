var express = require('express');
var passport = require('passport');
var path = require('path');
var router = express.Router();
var fs = require('fs');
var mongoose = require('mongoose');
var multiparty = require('connect-multiparty')
var multipartyMiddleware = multiparty()

router.get('/', function(req, res, next) {
  res.render('home', {
    active: {
      home: true
    },
    user: req.user,
  });
});

router.get('/about', function(req, res, next) {
  res.render('about', {
    active: {
      about: true
    },
    user: req.user,
  });
});

router.get('/visa', function(req, res, next) {
  res.render('visa', {
    active: {
      visa: true
    },
    user: req.user,
  });
});

router.get('/visa/download', function(req, res) {
  var base = path.resolve('.');
  var file = base + "/public/documents/visa-application.pdf";
  res.download(file);
});

router.post('/upload', multipartyMiddleware, function(req, res, next) {
  fs.readFile(req.files.uploadFile.path, function(err, data) {
    var newPath = "./public/uploads/" + getDateTime() + '-' + req.files
      .uploadFile.name;
    fs.writeFile(newPath, data, function(err) {
      res.render('home', {
        active: {
          home: true
        },
        user: req.user,
      });
    });
  });
})

router.get('/login', function(req, res, next) {
  res.render('login', {
    active: {
      login: true
    },
    message: req.flash('loginMessage'),
    user: req.user,
  });
});

router.get('/signup', function(req, res) {
  res.render('signup', {
    active: {
      signup: true
    },
    message: req.flash('signupMessage'),
    user: req.user,
  });
});

router.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile', {
    active: {
      profile: true
    },
    user: req.user,
  });
});

router.put('/update/:id', function(req, res) {
  user.findById(user.local.id, function(err, bear) {
    console.log(req.body);
    user.local.fname = req.body.fname;
    user.local.lname = req.body.lname;
    user.local.country = req.body.country;
    user.local.occupation = req.body.occupation;
    user.local.company = req.body.company;
    user.local.phone = req.body.phone;
    user.local.structural = req.body.structural;
    user.local.civils = req.body.civils;
    user.local.electrical = req.body.electrical;
    user.local.plumbing = req.body.plumbing;
    user.local.carpentry = req.body.carpentry;
    user.local.roofing = req.body.roofing;
    user.local.flooring = req.body.flooring;
    user.local.shopfitting = req.body.shopfitting;
    user.local.doorswindows = req.body.doorswindows;
    user.local.network = req.body.network;
    user.local.hardware = req.body.hardware;
    user.local.telecom = req.body.telecom;
    user.local.biometrics = req.body.biometrics;
    user.local.airconditioning = req.body.airconditioning;
    user.local.software = req.body.software;
    user.local.email = email;
    user.local.password = user.generateHash(
      password);

    user.save(function(err) {
      if (err)
        res.send(err);
      res.json({
        message: 'Profile updated!'
      });
    });

    res.render('profile', {
      active: {
        profile: true
      },
      user: req.user,
    });
  });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.render('home', {
    active: {
      home: true
    },
    user: req.user,
  });
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true,
}));

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
}));

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.render('home', {
    active: {
      home: true
    },
    user: req.user,
  });
}

function getDateTime() {

  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" +
    sec;
}
