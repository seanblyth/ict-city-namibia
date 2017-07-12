var express = require('express');
var passport = require('passport');
var path = require('path');
var router = express.Router();
var fs = require('fs');
var easyzip = require('easy-zip2').EasyZip;
var ncp = require('ncp').ncp;
var json2csv = require('json2csv');
var mongoose = require('mongoose');
var multiparty = require('connect-multiparty')
var multipartyMiddleware = multiparty()
var logger = require("../utils/logger");
var UserSchema = require('../models/user.js');

router.get('/', function(req, res, next) {
  admin = isAdmin(req);
  res.render('home', {
    active: {
      home: true
    },
    admin: admin,
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
  admin = isAdmin(req);
  fs.readFile(req.files.uploadFile.path, function(err, data) {
    var newPath = "./public/uploads/" + getDateTime() + '-' + req.files
      .uploadFile.name;
    fs.writeFile(newPath, data, function(err) {
      res.render('home', {
        active: {
          home: true
        },
        admin: admin,
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
  admin = isAdmin(req);
  res.render('profile', {
    active: {
      profile: true
    },
    admin: admin,
    user: req.user,
  });
});

router.post('/update/:id', function(req, res) {
  UserSchema.findOneAndUpdate({
    _id: req.params.id
  }, {
    local: {
      fname: req.body.fname,
      lname: req.body.lname,
      country: req.body.country,
      occupation: req.body.occupation,
      company: req.body.company,
      phone: req.body.phone,
      structural: req.body.structural,
      civils: req.body.civils,
      electrical: req.body.electrical,
      plumbing: req.body.plumbing,
      carpentry: req.body.carpentry,
      roofing: req.body.roofing,
      flooring: req.body.flooring,
      shopfitting: req.body.shopfitting,
      doorswindows: req.body.doorswindows,
      network: req.body.network,
      hardware: req.body.hardware,
      telecom: req.body.telecom,
      biometrics: req.body.biometrics,
      airconditioning: req.body.airconditioning,
      software: req.body.software,
      email: req.body.email,
      password: req.body.password,
    }
  }, function(err, user) {
    if (err) return err;
    UserSchema.findOne({
      _id: req.params.id
    }, function(err, user) {
      if (err) return err;
      return res.render('profile', {
        active: {
          profile: true
        },
        message: 'User updated!',
        user: user,
      });
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

router.get('/download-apps', function(req, res) {
  var zip = new easyzip();
  zip.zipFolder('./public/uploads/', function() {
    zip.writeToResponse(res, 'visa-applications');
    ncp('./public/uploads/',
      './public/uploads-done/',
      function(err) {
        if (err) {
          return console.error(err);
        }
        rmDir('./public/uploads/');

        if (!fs.existsSync('./public/uploads/')) {
          fs.mkdirSync('./public/uploads/');
        }
      });
  });
});

router.get('/csv', function(req, res) {
  var fields = ['local.fname', 'local.lname', 'local.email',
    'local.country', 'local.occupation',
    'local.company', 'local.phone', 'local.software',
    'local.airconditioning', 'local.biometrics',
    'local.telecom', 'local.hardware', 'local.network',
    'local.doorswindows', 'local.shopfitting',
    'local.flooring', 'local.roofing', 'local.carpentry',
    'local.plumbing', 'local.electrical',
    'local.civils', 'local.structural'
  ];

  var fieldNames = ['First Name', 'Surname', 'Email',
    'Country code', 'Occupation',
    'Company', 'Phone number', 'Software',
    'Air conditioning', 'Biometrics',
    'Telecommunication', 'Computer hardware', 'Computer networking',
    'Doors and Windows', 'Shopfitting',
    'Flooring', 'Roofing', 'Carpentry',
    'Plumbing', 'Electrical',
    'Civils', 'Structural'
  ];

  UserSchema.find({}, function(err, users) {
    console.warn(
      "----------------------------------------------------------");
    console.warn(users);
    var userData = users;
    var csv = json2csv({
      data: userData,
      fields: fields,
      fieldNames: fieldNames
    });

    fs.writeFile('./public/csv/data.csv', csv, function(err) {
      if (err) throw err;
      res.download('./public/csv/data.csv');
    });
  });
});

module.exports = router;

var isAdmin = function(req) {
  if (req.user) {
    if (req.user.local.email == "admin@local.com") {
      return true;
    }
  }
}

var rmDir = function(dirPath) {
  try {
    var files = fs.readdirSync(dirPath);
  } catch (e) {
    return;
  }
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
    }
  fs.rmdirSync(dirPath);
};

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
