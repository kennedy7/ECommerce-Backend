const express = require("express");
const {
  CreateProduct,
  fetchAllProducts,
  fetchProduct,
  DeleteProduct,
  UpdateProduct,
  SearchProduct,
} = require("../controllers/ProductController");
const { isAdmin } = require("../middlewares/auth");
const ProductRouter = express.Router();
const ProductValidator = require("../validators/productValidator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

ProductRouter.post(
  "/api/products",
  validatorMiddleware (ProductValidator.Productschema, "body"),
  // isAdmin,
  CreateProduct
);

ProductRouter.get("/api/products", fetchAllProducts);
ProductRouter.get("/api/products/search/:keyword", SearchProduct);
ProductRouter.get("/api/products/find/:slug", fetchProduct);
ProductRouter.delete("/api/products/:slug",
  //  isAdmin,
    DeleteProduct);
ProductRouter.patch("/api/products/:slug", 
  // isAdmin, 
  UpdateProduct);

module.exports = ProductRouter;
