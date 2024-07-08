const nodemailer = require('nodemailer');

// Function to configure and return Nodemailer transporter instance
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'Gmail', // Update with your email service provider
    auth: {
      user: process.env.EMAIL, // Your email address
      pass: process.env.PASSWORD // Your email password or app password for Gmail
    }
  });
};

// Export the transporter instance
module.exports = createTransporter();
