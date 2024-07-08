const nodemailer = require('nodemailer');
// Function to configure and return Nodemailer transporter instance
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD 
    }
  });
};


module.exports = createTransporter();
