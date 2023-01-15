const express = require("express");
const {
  CreateProduct,
  fetchProducts,
} = require("../controllers/ProductController");
const ProductRouter = express.Router();
const validatorMiddleware = require("../validators/middlewares");
const ProductValidator = require("../validators/productValidator");

ProductRouter.post(
  "/products",
  validatorMiddleware(ProductValidator.Productschema, "body"),
  CreateProduct
);

ProductRouter.get("/products", fetchProducts);

module.exports = ProductRouter;
