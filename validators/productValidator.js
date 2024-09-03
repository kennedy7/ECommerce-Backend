const Joi = require("joi");

const ProductValidator = {
  Productschema: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    desc: Joi.string().min(10).max(1000).required(),
    category: Joi.string().min(1).max(1000).required(),
    price: Joi.number().min(2).required(),
    quantity: Joi.number().min(1).max(10000).required(),
    images: Joi.array().items(Joi.string().min(10)).min(1).required(),
  }),
};

module.exports = ProductValidator;
