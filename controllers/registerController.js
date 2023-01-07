const bcrypt = require("bcrypt");
const User = require("../models/user");
const genAuthToken = require("../utils/genAuthToken");

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
