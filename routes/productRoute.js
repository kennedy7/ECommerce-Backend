const express = require("express");
const {
  CreateProduct,
  fetchProducts,
} = require("../controllers/ProductController");
const { isAdmin } = require("../middlewares/auth");
const ProductRouter = express.Router();
const validatorMiddleware = require("../middlewares/validatormiddleware");
const ProductValidator = require("../validators/productValidator");

ProductRouter.post(
  "/api/products",
  validatorMiddleware(ProductValidator.Productschema, "body"),
  isAdmin,
  CreateProduct
);

ProductRouter.get("/api/products", fetchProducts);

module.exports = ProductRouter;
