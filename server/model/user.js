const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const config = require("../config/key");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxLength: 50,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 1024,
  },
  lastname: {
    type: String,
    maxLength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
  },
  tokenExp: Number,
});
// befor save
userSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified('password')) {
    console.log("hide paasowed ");

    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next()
      })
    });
  } else {
    next();
  }
});



userSchema.methods.comparePassword = function (plaintext, cd) {
  bcrypt.compare(plaintext, this.password, function (err, isMatch) {
    if (err) return cd(err)
    cd(null, isMatch)
  })
}

userSchema.methods.generateToken = function (cd) {

  var user = this;
  var token = jwt.sign({ _id: user._id }, "secret")
  user.token = token

  user.save(function (err, user) {
    if (err, user) {
      if (err) return cd(err)
      cd(null, user)
    }
  })

}

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  jwt.verify(token, 'secret', function (err, decode) {
    user.findOne({ "_id": decode, "token": token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    })
  })
}






const User = mongoose.model("User", userSchema);

module.exports = { User };
