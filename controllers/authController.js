const bcrypt = require("bcrypt");
const User = require("../models/user");
const genAuthToken = require("../utils/genAuthToken");

//Register user controller
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

//login user controller
exports.LoginUser = async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email: email });
  if (!user) return res.status(400).send(" Invalid Email or Password ");
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).send(" Invalid Email or Password ");
  const token = genAuthToken(user);
  res.send(token);
};
