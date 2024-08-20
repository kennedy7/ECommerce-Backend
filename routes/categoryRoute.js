const express = require("express");
const { isAdmin } = require("../middlewares/auth");
const {
  createCategory,
  fetchAllCategories,
  fetchCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const CategoryValidator = require("../validators/categoryValidators");
const CategoryRouter = express.Router();

CategoryRouter.post(
  "/api/category",
  validatorMiddleware(CategoryValidator.createCategorySchema, "body"),
  // isAdmin,
  createCategory
);

CategoryRouter.get("/api/categories", fetchAllCategories);

CategoryRouter.get("/api/categories/:slug", fetchCategory);

CategoryRouter.put(
  "/api/categories/:slug",
  validatorMiddleware(CategoryValidator.updateCategorySchema, "body"),
  // isAdmin,
  updateCategory
);

CategoryRouter.delete("/api/categories/:slug", 
  // isAdmin,
   deleteCategory);

module.exports = CategoryRouter;
