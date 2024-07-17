const Joi = require("joi");

const categoryValidator = {
    createCategorySchema : Joi.object({
  name: Joi.string().required(),
  image: Joi.string().required(),
}),
updateCategorySchema: Joi.object({
  name: Joi.string().required(),
  image: Joi.string().required(),
})
}

module.exports = categoryValidator
