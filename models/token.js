// models/token.js

const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },

  // User reference to associate the token with a specific user
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Token type (e.g., "reset" for password reset token)
  type: { type: String, required: true },

  // Token expiration date (optional, set to null if the token doesn't expire)
  expiresAt: { type: Date, default: null },

  // Token creation date
  createdAt: { type: Date, default: Date.now },
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
