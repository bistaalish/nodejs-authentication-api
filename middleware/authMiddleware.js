// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const config = require("../config/config");
const logger = require("../utils/logger")

// Authentication middleware
exports.authenticateUser = (req, res, next) => {
  // Get the token from the request headers or other sources (e.g., query parameter, cookies)
  // const token = req.header("Authorization");
  const token = req.cookies.token
  console.log(token)
  // Check if a token exists in the request
  if (!token) {
    logger.error("Authentication failed: No token provided");
    return res.status(401).json({ status: "error", message: "No token provided" });
  }

  // Verify the token
  jwt.verify(token, config.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      logger.error("Authentication failed: Invalid token");
      return res.status(401).json({ status: "error", message: "Invalid token" });
    }

    // If the token is valid, attach the decoded user information to the request object for future use
    logger.info(`Authentication successful: User ID - ${decodedToken.userId}, Username - ${decodedToken.username}`);
    req.user = decodedToken;
    next(); // Continue to the next middleware or route handler
  });
};
