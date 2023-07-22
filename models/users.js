
// models/user.js

const mongoose = require("mongoose");

// Define the user schema using Mongoose
const userSchema = new mongoose.Schema({
  // User's username is required and must be unique
  username: { type: String, required: true, unique: true },

  // User's email address is required and must be unique
  email: { type: String, required: true, unique: true },

  // User's password is required and will be stored as a hashed value
  password: { type: String, required: true },

  // Record the date and time when the user document is created
  createdAt: { type: Date, default: Date.now },

  // Additional fields (you can customize this based on your app's requirements)

  // Example: Role of the user (admin, user, etc.)
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user", // Default role is set to "user" if not specified
  },
});

// Create the User model based on the user schema
const User = mongoose.model("User", userSchema);

// Export the User model to be used in other parts of the application
module.exports = User;
