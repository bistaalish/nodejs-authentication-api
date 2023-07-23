// models/user.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false, // The user's email is not verified by default
  },
  verificationToken: {
    type: String,
    default: null, // The verification token is initially set to null until generated during registration
  },
  resetToken: {
    type: String,
    default: null, // This field is used for password reset (if implemented)
  },
  resetTokenExpiration: {
    type: Date,
    default: null, // This field is used for password reset (if implemented)
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
