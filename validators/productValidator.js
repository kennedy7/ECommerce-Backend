const Joi = require("joi");

const ProductValidator = {
  Productschema: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    brand: Joi.string().min(2).max(200).required(),
    desc: Joi.string().min(10).max(1000).required(),
    category: Joi.string().min(1).max(1000).required(),
    price: Joi.number().min(2).max(10000).required(),
    image: Joi.string().min(10).required(),
  }),
};

module.exports = ProductValidator;
