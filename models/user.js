// models/user.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 200,
    requied: false,
  },
  profileImage: {
    type: String,
    requied: false,
    default: "default-profile-image.jpg",
  },
  dateOfBirth: {
    type: Date,
    requied: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  phoneNumber: {
    requied: true,
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
