const validatorMiddleware = (schema, property) => {
    return (req, res, next) => {
      const { error } = schema.validate(req[property]);
  
      if (error) return res.status(400).send(error.details[0].message);
      next();
    };
  };
  
  module.exports = validatorMiddleware;
  
