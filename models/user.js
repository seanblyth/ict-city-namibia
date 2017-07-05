var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
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

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};
module.exports = mongoose.model('User', userSchema);
