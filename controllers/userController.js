// controllers/userController.js
const User = require("../models/user");

// Verify user's email
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

    // Redirect the user to a success page or show a success message
    res.status(200).json({ message: "Email verification successful! You can now log in." });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
