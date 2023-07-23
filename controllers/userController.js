// controllers/userController.js
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const generateVerificationToken = require("../utils/generateToken");

exports.verifyEmail = async (req, res) => {
  const token = req.params.token;

  try {
    // Find the user with the provided verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      // If the user with the token is not found, handle the error
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
    // await sendResetLink(email,passwordResetToken,user.username);
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
  const { token } = req.params;
  const { password } = req.body;

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



