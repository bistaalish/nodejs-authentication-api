const nodemailer = require("nodemailer");
const config = require("../config/config")
async function sendEmail(subject,email,body) {
    try {
        var transport = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
          }
        });
    
        // Create the email content
        const mailOptions = {
          from: config.email, // Replace with your email
          to: email,
          subject: subject,
          html: body
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

module.exports = sendEmail;