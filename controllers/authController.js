// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/user");
const Joi = require("joi");
const nodemailer = require("nodemailer"); // Import nodemailer library
const shortid = require("shortid");

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
// Function to generate a random verification token
function generateVerificationToken() {
  // Implement your token generation logic here
  // For example, you can use a library like 'crypto-random-string' to generate a random string
  // Install the library using npm: 'npm install crypto-random-string'
  // Then use it to generate a random token:
  const token = shortid.generate();;
  return token;
}

// Function to send the account verification email
async function sendVerificationEmail(email, token) {
  try {
    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "49293cfade61f8",
        pass: "93bc24d13dce3f"
      }
    });

    // Create the email content
    const mailOptions = {
      from: "verification@example.com", // Replace with your email
      to: email,
      subject: "Account Verification",
      text: `Hello,\n\nPlease verify your account by clicking on the following link:\n\nhttp://localhost:3000/auth/verify/${token}`,
    };

    // Send the email
    await transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    console.log("Verification email sent successfully.");
  } catch (error) {
    console.error("Error sending verification email:", error.message);
  }
}
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
     sendVerificationEmail(newUser.email, verificationToken);

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