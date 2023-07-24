const winston = require("winston");

// Define the log format
const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// Create a logger instance
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.Console(), // Output logs to the console
    new winston.transports.File({ filename: "error.log", level: "error" }), // Log error messages to a file
    new winston.transports.File({ filename: "combined.log" }), // Log all messages to another file
  ],
});

module.exports = logger;
