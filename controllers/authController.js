// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/user");
const Joi = require("joi");

// Data validation schema for user registration
const registrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

// Data validation schema for user login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
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

    // Create a new user object and save it to the database
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
     // Generate a token for the newly registered user
     const token = jwt.sign({ userId: newUser._id, username: newUser.username }, config.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour (adjust as needed)
    });

   // Return the token in the response
   res.status(201).json({ status: "success", message: "User registered successfully", token });
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

    const { email, password } = req.body;

    // Check if the user exists based on the provided email
    const user = await User.findOne({ email });

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
