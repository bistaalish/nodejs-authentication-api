// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/user");
const sendEmail = require('../utils/sendEmail');
const Joi = require("joi");
const generateVerificationToken = require("../utils/generateToken");

// Data validation schema for user registration
const registrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

// Data validation schema for user login
const loginSchema = Joi.object({
  usernameOrEmail: Joi.string().required(),
  password: Joi.string().required(),
});

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      // If validation fails, return an error response
      return res.status(400).json({ status: "error", message: error.details[0].message });
    }
    const { username, email, password } = req.body;

    // Check if the username or email already exists in the database
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique verification token (e.g., using a random string generator)
    const verificationToken = generateVerificationToken();

    // Create a new user object and save it to the database
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken,
    });

    await newUser.save();
     // Send the account verification email to the user's registered email address
     const subject = "Account Verification";
     const clientEmail = email;
     const body =`<p>Hello ${newUser.username},</p><p>Please click on the following link to verify your email:</p><a href=http://localhost:${process.env.PORT}/auth/verify/${verificationToken}>${verificationToken}</a>`
     sendEmail(subject,clientEmail,body);
     // Return a success response
     res.status(201).json({ status: "success", message: "User registered. Please verify your email." });
   } catch (error) {
     console.error("Error registering user:", error.message);
     res.status(500).json({ status: "error", message: "Internal server error" });
   }
};


// User login
exports.loginUser = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      // If validation fails, return an error response
      return res.status(400).json({ status: "error", message: error.details[0].message });
    }

    const { usernameOrEmail, password } = req.body;

    // Check if the user exists based on the provided username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    // If the user is not found or the password doesn't match, return an error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    // Generate a token for the authenticated user
    const token = jwt.sign({ userId: user._id, username: user.username }, config.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour (adjust as needed)
    });

    // Return the token in the response
    res.status(200).json({ status: "success", message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Update user profile information
exports.updateProfile = async (req, res) => {
  try {
    // Get the updated profile information from the request body
    const { username, email, /* other profile fields */ } = req.body;
    const uname = req.user.username;
    // Get the authenticated user from the auth middleware
      // Find the user with the provided verification token
      const user = await User.findOne({ "username": uname });

      if (!user) {
        // If the user with the token is not found, handle the error
        return res.status(404).json({ message: "User not found" });
      }
  //   // Update the user's profile information
    user.username = username;
    user.email = email;
    /* Update other profile fields */

    await user.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    // Get the current password and new password from the request body
    const { currentPassword, newPassword } = req.body;
    const uname = req.body.username;
    // Get the authenticated user from the auth middleware
    const user = await User.findOne({ uname });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }


    // Verify the current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // Update the user's password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    // Get the authenticated user from the auth middleware
    const user = req.user;

    // Check if the user exists in the database
    const existingUser = await User.findOne({ username: user.username });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user's account
    await User.deleteOne({ username: user.username });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};