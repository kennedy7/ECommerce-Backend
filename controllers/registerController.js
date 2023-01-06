const bcrypt = require("bcrypt");
const Joi = require("joi");

exports.RegisterController = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(3).max(200).required().email,
    password: Joi.string().min(6).max(1000).required(),
  });
};
