const Joi = require("joi");

const AuthValidator = {
  Registerschema: Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(3).max(200).required().email(),
    password: Joi.string().min(6).max(1000).required(),
  }),
  Loginschema: Joi.object({
    email: Joi.string().min(3).max(200).required().email(),
    password: Joi.string().min(6).max(1000).required(),
  }),
  ForgotPasswordSchema: Joi.object({
    email: Joi.string().email().required()
  }),
  ResetPasswordSchema : Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required()
  })
};

module.exports = AuthValidator;
