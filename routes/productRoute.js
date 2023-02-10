const express = require("express");
const {
  CreateProduct,
  fetchAllProducts,
  fetchProduct,
  DeleteProduct,
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

ProductRouter.get("/api/products", fetchAllProducts);
ProductRouter.get("/api/products/find/:id", fetchProduct);
ProductRouter.delete("/api/products/:id", isAdmin, DeleteProduct);

module.exports = ProductRouter;
