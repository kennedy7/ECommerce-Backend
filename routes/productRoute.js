const express = require("express");
const {
  CreateProduct,
  fetchProducts,
} = require("../controllers/ProductController");
const ProductRouter = express.Router();
const validatorMiddleware = require("../validators/middlewares");
const ProductValidator = require("../validators/productValidator");

ProductRouter.post(
  "/api/products",
  validatorMiddleware(ProductValidator.Productschema, "body"),
  CreateProduct
);

ProductRouter.get("/api/products", fetchProducts);

module.exports = ProductRouter;
