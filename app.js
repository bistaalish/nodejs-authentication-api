// app.js or server.js

const express = require("express");
const mongoose = require("mongoose");
const config = require("./config/config");
const authRoutes = require("./routes/authRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const ProtectedRoutes = require("./routes/protectedRoutes");
const authMiddleware = require('./middleware/authMiddleware');
const cors = require("cors"); // Import the cors middleware
const morgan = require("morgan"); // Import the morgan middleware
const logger = require("./utils/logger"); // Import the logger we created in the previous step


const app = express();

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

  // Parse incoming JSON data
app.use(express.json());

// Read the allowed origins from the .env file
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
// Use the cors middleware to allow requests from the specified origins
app.use(cors({ origin: allowedOrigins }));

// Log HTTP requests using morgan
app.use(morgan("combined", { stream: { write: (message) => logger.info(message) } }));

// Set up routes
app.use("/users", authRoutes); // All auth-related routes will be prefixed with '/auth'
app.use("/users/verify/",verificationRoutes);
// Other configurations and middleware...
// Example of a protected route
app.use("/users/profile",ProtectedRoutes)

// Example of a protected route
app.get("/users/api/profile", authMiddleware.authenticateUser, (req, res) => {
  // Accessing this route requires a valid token
  // The authenticated user's information is available in req.user
  const userData = {
    userId: req.user.userId,
    username: req.user.username,
    email: req.user.email,
  };

  res.json({ status: "success", message: "Protected route accessed", user: userData });
});

// Custom error handler middleware to log errors
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  next(err);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
