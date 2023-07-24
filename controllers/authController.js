// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/user");
const sendEmail = require('../utils/sendEmail');
const logger = require("../utils/logger")
const Joi = require("joi");
const generateVerificationToken = require("../utils/generateToken");

// Data validation schema for user registration
const registrationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phoneNumber: Joi.string().length(10).pattern(/^[0-9]{10}$/).required(),
  fullName: Joi.string().max(100).required(),
  dateOfBirth: Joi.date(),
});

// Data validation schema for user login
const loginSchema = Joi.object({
  usernameOrEmail: Joi.string().required(),
  password: Joi.string().required(),
});
const changePasswordRegistrationSchema = Joi.object({
  currentPassword: Joi.string().min(8).required(),
  newPassword: Joi.string().min(8).required(),
});



// Register a new user
exports.registerUser = async (req, res) => {
  try {
    //  Input validation for registration
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      // If validation fails, return an error response
      logger.error("User registration validation error:", error.details[0].message);  
      return res.status(400).json({ status: "error", message: error.details[0].message });
    }
    const { username, email, password,dateOfBirth,fullName,phoneNumber   } = req.body;

    // Check if the username or email already exists in the database
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      logger.error("User registration failed: Username or email already exists");
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
      dateOfBirth,
      fullName,
      phoneNumber,
      password: hashedPassword,
      verificationToken,
    });

    await newUser.save();
    // Generate a JWT for the user
    const tokenPayload = {
      userId: newUser._id,
      username: newUser.username,
      // Add any other relevant user data to the token payload
    };
    const token = jwt.sign(tokenPayload, config.JWT_SECRET, { expiresIn: '1h' });
    // Set the token as a cookie with the 'httpOnly' flag to prevent client-side JavaScript access
    res.cookie('token', token, { httpOnly: true });
     // Send the account verification email to the user's registered email address
    // Constructing email body
     const subject = "Account Verification";
     const clientEmail = email;
     const body =`<p>Hello ${newUser.username},</p><p>Please click on the following link to verify your email:</p><a href=http://localhost:${process.env.PORT}/users/verify/${verificationToken}>${verificationToken}</a>`
    //  Send email using sendEMail
     sendEmail(subject,clientEmail,body);
     // Store into log andReturn a success response
     logger.info(`User registered successfully: Username - ${newUser.username}, Email - ${newUser.email}`);
     res.status(201).json({ status: "success", message: "User registered. Please verify your email." });
   } catch (error) {
    //  Storing the error in the logs 
     logger.error("Error registering user:", error.message);
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
      logger.error("User login validation error:", error.details[0].message);
      return res.status(400).json({ status: "error", message: error.details[0].message });
    }

    const { usernameOrEmail, password } = req.body;

    // Check if the user exists based on the provided username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    // If the user is not found or the password doesn't match, return an error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.error("User login failed: Invalid credentials");
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    // Generate a token for the authenticated user
    const token = jwt.sign({ userId: user._id, username: user.username }, config.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour (adjust as needed)
    });
    res.cookie('token', token, { httpOnly: true });
    // Return the token in the response
    logger.info(`User login successful: Username - ${user.username}, Email - ${user.email}`);
    res.status(200).json({ status: "success", message: "Login successful" });
  } catch (error) {
    logger.error("Error during login:", error.message);
    console.error("Error during login:", error.message);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};


// Change user password
exports.changePassword = async (req, res) => {
  try {
    const { error } = changePasswordRegistrationSchema.validate(req.body);
    if (error) {
      // If validation fails, return an error response
      logger.error("Change password validation error:", error.details[0].message);
      return res.status(400).json({ status: "error", message: error.details[0].message });
    }
    // Get the current password and new password from the request body
    const { currentPassword, newPassword } = req.body;
    const uname = req.body.username;
    // Get the authenticated user from the auth middleware
    const user = await User.findOne({ uname });

    if (!user) {
      logger.error("Invalid or expired password reset token:", error.details[0].message);
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

    logger.info(`Password changed successfully: Username - ${user.username}`);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    logger.error("Error changing password:", error.message);
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
      logger.error("User account deletion failed: User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user's account
    await User.deleteOne({ username: user.username });
    logger.info(`User account deleted: Username - ${user.username}`);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    logger.error("Error deleting account:", error.message);
    console.error("Error deleting account:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};