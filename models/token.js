// models/token.js

const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
