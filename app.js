// app.js or server.js

const express = require("express");
const mongoose = require("mongoose");
const config = require("./config/config");
const authRoutes = require("./routes/authRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const authMiddleware = require('./middleware/authMiddleware');
const protectedRouted = require("./routes/protectedRoutes")
const cors = require("cors"); // Import the cors middleware
const morgan = require("morgan"); // Import the morgan middleware
const logger = require("./utils/logger"); // Import the logger we created in the previous step
const cookieParser = require("cookie-parser"); // Import the cookie-parser middleware
const rateLimit = require("express-rate-limit");
var cookieSession = require('cookie-session')
const helmet = require("helmet");

const app = express();
// Apply rate limiting middleware to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
require("dotenv").config()
// Connect to MongoDB
mongoose
  .connect(config.mongodb.url, config.mongodb.options)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });
  // Use the helmet middleware for built-in security features, including CSRF protection
  app.use(helmet());

  // Parse incoming JSON data
app.use(express.json());
app.use(cookieParser()); // Use the cookie-parser middleware before csurf
app.use(limiter);
// Read the allowed origins from the .env file
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
// Use the cors middleware to allow requests from the specified origins
app.use(cors({ origin: allowedOrigins }));
app.use(cookieSession({
  name: 'session',
  keys: [config.COOKIE_SECRET],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
// Log HTTP requests using morgan
app.use(morgan("combined", { stream: { write: (message) => logger.info(message) } }));
// Apply CSRF protection middleware to the whole application
// app.use(csrf({ cookie: true }));
// Enable CSRF protection
// Set up routes
// Apply CSRF protection middleware to the whole application
app.use("/users", authRoutes); // All auth-related routes will be prefixed with '/auth'
app.use("/users/verify/",verificationRoutes);
// Other configurations and middleware...

// Example of a protected route
app.use("/users/profile",protectedRouted); // All auth-related routes will be prefixed with '/auth'

// Example of a protected route
app.get("/api/profile", authMiddleware.authenticateUser, (req, res) => {
  // Accessing this route requires a valid token
  // The authenticated user's information is available in req.user
  const userData = {
    userId: req.user.userId,
    username: req.user.username,
    email: req.user.email,
  };

  res.json({ status: "success", message: "Protected route accessed", user: userData });
});
app.use(function (req, res, next) {
  req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
  next()
})


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
