const path = require("path");
const transporter = require("../utils/nodemailerConfig");

exports.contact = async (req, res) => {
  const { name, email, phoneNumber, message } = req.body;
  //   console.log(req.body);
  // Validate input fields
  if (!name || !email || !phoneNumber || !message) {
    return res.status(400).send("All fields are required.");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Please enter a valid email address.");
  }

  // Additional validation for phoneNumber
  const phoneRegex = /^[0-9]{10,15}$/; // Example: only digits, 10-15 characters
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).send("Please enter a valid phone number.");
  }
  //send mail
  try {
    const mailOptions = {
      from: email,
      to: process.env.EMAIL,
      subject: `Customer - Powermart Website`,
      html: `
        <div style="background-color: #e8f5e9; padding: 20px; font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2e7d32;">Customer Contact</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #2e7d32;">${email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phoneNumber}" style="color: #2e7d32;">${phoneNumber}</a></p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Error sending email, please try again...");
      } else {
        console.log("Contact Email sent successfully!:", info.response);
        res.status(200).send("Message sent successfully");
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
