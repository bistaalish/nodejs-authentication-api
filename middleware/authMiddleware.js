// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const config = require("../config/config");

// Authentication middleware
exports.authenticateUser = (req, res, next) => {
  // Get the token from the request headers or other sources (e.g., query parameter, cookies)
  const token = req.header("Authorization");

  // Check if a token exists in the request
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided" });
  }

  // Verify the token
  jwt.verify(token, config.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ status: "error", message: "Invalid token" });
    }

    // If the token is valid, attach the decoded user information to the request object for future use
    req.user = decodedToken;
    next(); // Continue to the next middleware or route handler
  });
};
