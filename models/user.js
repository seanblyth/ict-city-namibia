var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  resetPasswordToken: String,
  resetPasswordExpires: String,
  local: {
    fname: String,
    lname: String,
    country: String,
    occupation: String,
    company: String,
    phone: String,
    structural: Boolean,
    civils: Boolean,
    electrical: Boolean,
    plumbing: Boolean,
    carpentry: Boolean,
    roofing: Boolean,
    flooring: Boolean,
    shopfitting: Boolean,
    doorswindows: Boolean,
    network: Boolean,
    hardware: Boolean,
    telecom: Boolean,
    biometrics: Boolean,
    airconditioning: Boolean,
    software: Boolean,
    email: String,
    password: String,
  },
});

userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
