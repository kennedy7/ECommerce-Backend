const { default: slugify } = require("slugify");
const Category = require("../models/category");


// Create a Category
exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    const slug = slugify(name, { lower: true });
    const category = new Category({
      name,
      slug,
      image, // Directly save the image URL to the DB
    });

    const savedCategory = await category.save();
    res.status(200).send(savedCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// Fetch All Categories
exports.fetchAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ _id: -1 });
    res.status(200).send(categories);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// Fetch Single Category by Slug
exports.fetchCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    res.status(200).send(category);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    category.name = name;
    category.slug = slugify(name, { lower: true });
    category.image = image; // Update the image URL directly

    const updatedCategory = await category.save();
    res.status(200).send(updatedCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ slug: req.params.slug });

    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    // Delete all products associated with this category
    await Product.deleteMany({ category: category.slug });

    res.status(200).send({ message: "Category and associated products deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
