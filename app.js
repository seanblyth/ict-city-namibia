var express = require('express');
var logger = require('morgan');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var hbs = require('express-hbs');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var morgan = require('morgan');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var cacheTime = 86400000 * 7;
var passport = require('passport');
var configDB = require('./config/database.js');
var LocalStrategy = require('passport-local').Strategy;

mongoose.connect(configDB.mainDb);

var db = mongoose.connection;

db.on('error', function(err) {
  console.error('There was a db connection error');
  return console.error(err.message);
});

db.once('connected', function() {
  return console.log('Successfully connected to ' + configDB.mainDb);
});

db.once('disconnected', function() {
  return console.error('Successfully disconnected from ' + configDB.mainDb);
});

var app = module.exports = express();

app.set('view engine', 'hbs');

app.engine('hbs', hbs.express4({
  defaultLayout: __dirname + '/views/layouts/main.hbs',
  partialsDir: __dirname + '/views/partials',
  layoutsDir: __dirname + '/views/layouts'
}));

app.set('views', path.join(__dirname, '/views'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'shhsecret'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', routes);
app.use('/users', users);

require('./config/passport')(passport);

app.use(morgan('combined'));

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      user: req.user,
      error: err,
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    user: req.user,
    error: {},
  });
});

module.exports = app;
