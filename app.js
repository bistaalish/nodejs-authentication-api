// app.js or server.js

const express = require("express");
const mongoose = require("mongoose");
const config = require("./config/config");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors"); // Import the cors middleware

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


// Set up routes
app.use("/api/auth", authRoutes); // All auth-related routes will be prefixed with '/auth'
// Other configurations and middleware...

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
