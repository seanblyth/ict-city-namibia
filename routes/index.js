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
var appRoot = require('app-root-dir').get();
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

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
  admin = isAdmin(req);
  res.render('about', {
    active: {
      about: true
    },
    admin: admin,
    user: req.user,
  });
});

router.get('/visa', function(req, res, next) {
  admin = isAdmin(req);
  res.render('visa', {
    active: {
      visa: true
    },
    admin: admin,
    user: req.user,
  });
});

router.get('/visa/download', function(req, res) {
  var file = path.join(appRoot, "/public/documents/visa-application.pdf");
  res.download(file);
});

router.post('/upload', multipartyMiddleware, function(req, res, next) {
  admin = isAdmin(req);
  fs.readFile(req.files.uploadFile.path, function(err, data) {
    var newPath = path.join(appRoot, "/public/uploads/") + getDateTime() +
      '-' +
      req.files.uploadFile.name;
    fs.writeFile(newPath, data, function(
      err) {
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
  admin = isAdmin(req);
  res.render('login', {
    active: {
      login: true
    },
    message: req.flash('loginMessage'),
    admin: admin,
    user: req.user,
  });
});

router.get('/signup', function(req, res) {
  admin = isAdmin(req);
  res.render('signup', {
    active: {
      signup: true
    },
    message: req.flash('signupMessage'),
    admin: admin,
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
      admin = isAdmin(req);
      return res.render('profile', {
        active: {
          profile: true
        },
        message: 'User updated!',
        admin: admin,
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
  zip.zipFolder(path.join(appRoot, "/public/uploads/"), function() {
    zip.writeToResponse(res, 'visa-applications');
    ncp(path.join(appRoot, "/public/uploads/"),
      path.join(appRoot, "/public/uploads-done/"),
      function(err) {
        if (err) {
          return console.error(err);
        }
        rmDir(path.join(appRoot, "/public/uploads/"));

        if (!fs.existsSync(path.join(appRoot,
            "/public/uploads/"))) {
          fs.mkdirSync(path.join(appRoot,
            "/public/uploads/"));
        }
      });
  });
});

router.get('/csv', function(req, res) {
  var fields = ['local.fname', 'local.lname',
    'local.email',
    'local.country', 'local.occupation',
    'local.company', 'local.phone', 'local.software',
    'local.airconditioning', 'local.biometrics',
    'local.telecom', 'local.hardware', 'local.network',
    'local.doorswindows', 'local.shopfitting',
    'local.flooring', 'local.roofing',
    'local.carpentry',
    'local.plumbing', 'local.electrical',
    'local.civils', 'local.structural'
  ];

  var fieldNames = ['First Name', 'Surname', 'Email',
    'Country code', 'Occupation',
    'Company', 'Phone number', 'Software',
    'Air conditioning', 'Biometrics',
    'Telecommunication', 'Computer hardware',
    'Computer networking',
    'Doors and Windows', 'Shopfitting',
    'Flooring', 'Roofing', 'Carpentry',
    'Plumbing', 'Electrical',
    'Civils', 'Structural'
  ];

  UserSchema.find({}, function(err, users) {
    var userData = users;
    var csv = json2csv({
      data: userData,
      fields: fields,
      fieldNames: fieldNames
    });

    fs.writeFile(path.join(appRoot, "/public/csv/data.csv"), csv,
      function(err) {
        if (err) throw err;
        res.download(path.join(appRoot, "/public/csv/data.csv"));
      });
  });
});

router.get('/reset/:token', function(req, res) {
  UserSchema.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (!user) {
      res.render('forgot', {
        message: 'Password reset token is invalid or has expired.',
      });
    }
    res.render('reset', {
      resetPasswordToken: req.params.token,
      user: req.user
    });
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      UserSchema.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function(err, user) {
        if (!user) {
          res.render('forgot', {
            message: 'Password reset token is invalid or has expired.',
          });
        }
        console.warn('*** user reset ***');
        console.warn(user);
        user.local.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: 'smtp-relay.sendinblue.com',
        port: 587,
        auth: {
          user: 'sean@outfront.co.za',
          pass: '8ZqATr2B7KPOLz9U'
        }
      });
      var mailOptions = {
        to: user.local.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' +
          user.local.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

router.get('/forgot', function(req, res) {
  res.render('forgot', {
    user: req.user
  });
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      UserSchema.findOne({
        'local.email': req.body.email
      }, function(err, user) {
        if (!user) {
          res.render('forgot', {
            message: 'No account with that email address exists.',
          });
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: 'smtp-relay.sendinblue.com',
        port: 587,
        auth: {
          user: 'sean@outfront.co.za',
          pass: '8ZqATr2B7KPOLz9U'
        }
      });
      var mailOptions = {
        to: user.local.email,
        from: 'passwordreset@demo.com',
        subject: 'ICT City Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.local
          .email +
          ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
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

  return year + ":" + month + ":" + day + ":" +
    hour + ":" + min + ":" +
    sec;
}
