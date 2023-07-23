// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const UserController = require("../controllers/userController");

// Route to register a new user
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/password-reset", UserController.requestPasswordReset);
router.post("/reset/", UserController.resetPassword);
module.exports = router;
