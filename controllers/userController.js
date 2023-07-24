// controllers/userController.js
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Joi = require("joi");
const sendEmail = require("../utils/sendEmail");
const logger = require("../utils/logger");
const generateVerificationToken = require("../utils/generateToken");

// Datavalidation Schema for Email only
const emailValidationSchema = Joi.object({
  email: Joi.string().email().required(),
});

const PasswordValidationSchema = Joi.object({
  password: Joi.string().min(8).max(32),
})
// Update Profile Schema
const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  bio: Joi.string().max(200),
  phoneNumber: Joi.string().length(10).pattern(/^[0-9]{10}$/).required(),
  fullName: Joi.string().max(100).required(),
  dateOfBirth: Joi.date(),
});

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Get the authenticated user from the auth middleware
    const user = req.user;

    // Find the user in the database
    const foundUser = await User.findOne({ username: user.username });

    if (!foundUser) {
      logger.error("User profile retrieval failed: User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sensitive data (e.g., password) before sending the user object in the response
    const userProfile = {
      username: foundUser.username,
      bio: foundUser.bio,
      profileImage: foundUser.profileImage,
      dateOfBirth: foundUser.dateOfBirth,
      fullName: foundUser.fullName,
      phoneNumber: foundUser.phoneNumber,
      email: foundUser.email,
      verified: foundUser.verified,
      createdAt: foundUser.createdAt,
      /* Add other profile fields */
    };

    logger.info(`User profile retrieved: Username - ${userProfile.username}`);
    res.status(200).json({ status: "success", user: userProfile });
  } catch (error) {
    logger.error("Error retrieving user profile:", error.message);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Email Verification by Sending Verification Link
exports.verifyEmail = async (req, res) => {
  const token = req.params.token;

  try {
    // Find the user with the provided verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      // If the user with the token is not found, handle the 
      logger.error("Email verification failed: Invalid or expired verification token.");
      return res.status(404).json({ message: "Invalid or expired verification token." });
    }
    const username = user.username
    // Mark the user's email as verified by setting the 'verified' field to 'true'
    user.verified = true;
    user.verificationToken = null; // Optional: Clear the verification token after successful verification
    await user.save();
    const subject = "Account Activation"
    const email = user.email
    const body = `<p>Hello ${username},</p><p>welcome to auth api</p>`

    sendEmail(subject,email,body);
    
    // Redirect the user to a success page or show a success message
    logger.info(`Email verification successful for user: ${user.username}`);
    res.status(200).json({ message: "Email verification successful! You can now log in." });
  } catch (error) {
    logger.error("Error verifying email:", error.message);
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Request password reset handler
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const { error } = emailValidationSchema.validate(req.body);
    if (error) {
      // If validation fails, return an error response
      logger.error("Password reset request validation error:", error.details[0].message);
      return res.status(400).json({ status: "error", message: error.details[0].message });
    }
    // Find the user with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      logger.error("Password reset request failed: User not found");
      return res.status(404).json({ message: "User not found" });
    }
    const username = user.username
    // Generate a password reset token
    const passwordResetToken = await generateVerificationToken();

    // Set the password reset token and expiration time in the user's record
     user.resetToken = passwordResetToken;
     user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();
    const Subject = "Password Reset";
    const body = `<p>Hello ${username},</p><p>Please click on the following link to reset your account's password:</p><a href=http://localhost:${process.env.PORT}/password-reset/:${passwordResetToken}>${passwordResetToken}</a>`;
    sendEmail(Subject,email,body);
    logger.info(`Password reset email sent to user: ${user.username}`);
    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    logger.error("Error requesting password reset:", error.message);
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Password reset handler
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const { error } = PasswordValidationSchema.validate(req.body);
    if (error) {
      // If validation fails, return an error response
      logger.error("Password reset validation error:", error.details[0].message);
      return res.status(400).json({ status: "error", message: error.details[0].message });
    }
    // Find the user with the provided password reset token
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

    if (!user) {
      logger.error("Password reset failed: Invalid or expired password reset token");
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    logger.info(`Password reset successful for user: ${user.username}`);
    // Return success response
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    logger.error("Error resetting password:", error.message);
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Update user profile information
exports.updateProfile = async (req, res) => {
  try {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      logger.error("User profile update validation error:", error.details[0].message);
      // If validation fails, return an error response
      return res.status(400).json({ status: "error", message: error.details[0].message });
    }
    // Get the updated profile information from the request body
    const { username, email,dateOfBirth,fullName,phoneNumber,bio /* other profile fields */ } = req.body;
    const uname = req.user.username;
    // Get the authenticated user from the auth middleware
      // Find the user with the provided verification token
      const user = await User.findOne({ "username": uname });

      if (!user) {
        // If the user with the token is not found, handle the error
        logger.error("User profile update failed: User not found");
        return res.status(404).json({ message: "User not found" });
      }
  //   // Update the user's profile information
    user.username = username;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.dateOfBirth = dateOfBirth;
    user.fullName = fullName;
    user.bio = bio;
    /* Update other profile fields */

    await user.save();

    logger.info(`User profile updated: Username - ${user.username}, Email - ${user.email}`);
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    logger.error("Error updating profile:", error.message);
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};





