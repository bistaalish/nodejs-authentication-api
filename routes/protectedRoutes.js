// Protected Routes
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const UserController = require("../controllers/userController");


//  Update User Profile
router.put("/update-profile", authMiddleware.authenticateUser, UserController.updateProfile);
// Change user password
router.put("/change-password", authMiddleware.authenticateUser, authController.changePassword);
// Delete user account
router.delete("/delete-account", authMiddleware.authenticateUser, authController.deleteAccount);
// Get Users Profile
router.get("/", authMiddleware.authenticateUser, UserController.getUserProfile);
module.exports = router;