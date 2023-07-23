// config/config.js
require("dotenv").config()
module.exports = {
    // Other configurations...
    JWT_SECRET: process.env.JWT_SECRET,
    // MongoDB configuration
    mongodb: {
      url: process.env.MONGODB_URI, // Replace with your MongoDB connection URL
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.DB,
      },
    },
  };
  