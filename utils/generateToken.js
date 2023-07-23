// Function to generate a random verification token
const shortid = require("shortid");

function generateVerificationToken() {
    // Implement your token generation logic here
    // For example, you can use a library like 'crypto-random-string' to generate a random string
    // Install the library using npm: 'npm install crypto-random-string'
    // Then use it to generate a random token:
    const token = shortid.generate();;
    return token;
  }
  module.exports = generateVerificationToken;