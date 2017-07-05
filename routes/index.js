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
  var file = "./public/documents/visa-application.pdf";
  res.download(file);
});

router.post('/upload', multipartyMiddleware, function(req, res, next) {
  fs.readFile(req.files.uploadFile.path, function(err, data) {
    var newPath = "./public/uploads/" + getDateTime() + '-' + req.files
      .uploadFile.name;
    fs.writeFile(newPath, data, function(err) {
      res.redirect('/', {
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

router.put('/profile', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/profile',
  failureFlash: true,
}));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/', {
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
  res.redirect('/', {
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

  return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}
