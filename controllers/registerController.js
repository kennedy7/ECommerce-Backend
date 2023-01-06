const bcrypt = require("bcrypt");
const Joi = require("joi");
const { User } = require("../models/user");
const genAuthToken = require("../utils/genAuthToken");

exports.RegisterUser = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(3).max(200).required().email,
    password: Joi.string().min(6).max(1000).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, email, password } = req.body;

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send(" User with this email exist...");

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

exports.LoginUser = (req, res) => {
  const { email, password } = req.body;
};
