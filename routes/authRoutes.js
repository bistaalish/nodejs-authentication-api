// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const UserController = require("../controllers/userController");

// Route to register a new user
router.post("/register", authController.registerUser);
// Authenticate
router.post("/login", authController.loginUser);
// Password Reset Request for token
router.post("/password-reset", UserController.requestPasswordReset);
// Reset password link
router.post('/password-reset/:token', UserController.resetPassword);


module.exports = router;
