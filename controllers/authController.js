const bcrypt = require("bcrypt");
const User = require("../models/user");
const crypto = require('crypto');
const genAuthToken = require("../utils/genAuthToken");
const { ResetPasswordSchema } = require("../validators/authValidators");
const  transporter  = require("../utils/nodemailerConfig");

// Register user controller
exports.RegisterUser = async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send(" User with this email exist... ");

  const { name, email, password } = req.body;

  user = new User({
    name: name,
    email: email,
    password: password,
  });
  user.password = await bcrypt.hash(user.password, 10);
  user = await user.save();
  const token = genAuthToken(user);
  res.send(token);
};

// login user controller
exports.LoginUser = async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email: email });
  if (!user) return res.status(400).send(" Invalid Email or Password ");
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).send(" Invalid Email or Password ");
  const token = genAuthToken(user);
  res.send(token);
};

// Forgot password controller
exports.ForgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send(" User with this email does not exist ");

  // Generate a unique token
  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.save();

// Send password reset email
const resetLink = `${req.headers.origin}/reset-password/${token}`;
  
  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL,
    subject: 'Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    ${resetLink}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
         <p>Please click on the following link, or paste this into your browser to complete the process:</p>
         <a href="${resetLink}">${resetLink}</a>
         <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`

  };

  transporter.sendMail(mailOptions, (err) => {
    
  if (err){ 
    console.error('Error sending email:', err);
    return res.status(500).send('Error sending email');
  }
    res.status(200).send('Recovery email sent');
  });
};

// Reset password controller
exports.ResetPassword = async (req, res) => {
  const { error } = ResetPasswordSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find the user by token and validate expiry
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    }

    // Update user password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save updated user
    await user.save();

    // Send response
    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




