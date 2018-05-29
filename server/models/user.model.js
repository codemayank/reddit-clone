const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = 'This is the jwt secret please change it';

let userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  token: { type: String }
});

userSchema.pre('save', function(next) {
  let user = this;

  if (user.isModified('password')) {
    let password = user.password;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.statics.findByCredentials = function(username, password) {
  let User = this;
  return User.findOne({ username: username }).then(user => {
    if (!user) {
      let message = 'Loginerr1';
      return Promise.reject(message);
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject('Loginerr2');
        }
      });
    });
  });
};

userSchema.methods.generateAuthToken = function() {
  let user = this;
  let token = jwt
    .sign(
      {
        _id: user._id.toHexString()
      },
      jwtSecret,
      { expiresIn: '7d' }
    )
    .toString();

  user.token = token;
  return user.save().then(() => {
    return token;
  });
};

userSchema.methods.removeToken = function() {
  let user = this;
  return user.update({
    token: ''
  });
};

userSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (e) {
    console.log('logging in find by token in user model', e);
    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    token: token
  });
};

module.exports = mongoose.model('User', userSchema);
