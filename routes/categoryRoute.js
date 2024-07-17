const express = require("express");
const { createCategory, fetchAllCategories, fetchCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const CategoryValidator = require("../validators/categoryValidators");
const router = express.Router();

router.post(
  "/api/categories",
  validatorMiddleware(CategoryValidator.createCategorySchema, "body"),
  createCategory
);

router.get("/api/categories", fetchAllCategories);

router.get("/api/categories/:slug", fetchCategory);

router.put(
  "/api/categories/:slug",
  validatorMiddleware(CategoryValidator.updateCategorySchema, "body"),
  updateCategory
);

router.delete("/api/categories/:slug", deleteCategory);

module.exports = router;
