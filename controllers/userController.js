// controllers/userController.js
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require("nodemailer"); // Import nodemailer library
const generateVerificationToken = require("../utils/generateToken");

// Account activation email
async function accountActivationEmail(email,user) {
  try {
    var transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Create the email content
    const mailOptions = {
      from: "verification@example.com", // Replace with your email
      to: email,
      subject: "Account Activation",
      html: `<p>Hello ${user},</p><p>welcome to auth api</p>`,
    };

    // Send the email
    await transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    console.log("Password reset email sent successfully.");
  } catch (error) {
    console.error("Error sending reset email:", error.message);
  }
}
// Verify user's email

async function sendResetLink(email, token,user) {
  try {
    var transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Create the email content
    const mailOptions = {
      from: "verification@example.com", // Replace with your email
      to: email,
      subject: "Password Reset",
      html: `<p>Hello ${user},</p><p>Please click on the following link to reset your account's password:</p><a href=http://localhost:${process.env.PORT}/password-reset/:${token}>${token}</a>`,
    };

    // Send the email
    await transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    console.log("Password reset email sent successfully.");
  } catch (error) {
    console.error("Error sending reset email:", error.message);
  }
}
exports.verifyEmail = async (req, res) => {
  const token = req.params.token;

  try {
    // Find the user with the provided verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      // If the user with the token is not found, handle the error
      return res.status(404).json({ message: "Invalid or expired verification token." });
    }

    // Mark the user's email as verified by setting the 'verified' field to 'true'
    user.verified = true;
    user.verificationToken = null; // Optional: Clear the verification token after successful verification
    await user.save();
    accountActivationEmail(user.email,user.username);
    // Redirect the user to a success page or show a success message
    res.status(200).json({ message: "Email verification successful! You can now log in." });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Request password reset handler
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a password reset token
    const passwordResetToken = await generateVerificationToken();

    // Set the password reset token and expiration time in the user's record
     user.resetToken = passwordResetToken;
     user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();
    await sendResetLink(email,passwordResetToken,user.username);
    // Send the password reset email (use Nodemailer)
    // ... (send email code)

    // Return success response
    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Password reset handler
exports.resetPassword = async (req, res) => {
  const { password, token } = req.body;

  try {
    // Find the user with the provided password reset token
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    // Return success response
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

