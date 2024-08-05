const { default: slugify } = require("slugify");
const Category = require("../models/category");
const cloudinary = require("../utils/cloudinary");

exports.createCategory = async (req, res) => {
  
  try {
    const { name, image } = req.body;
   
    const uploadResponse = await cloudinary.uploader.upload(image);
    
    const slug = slugify(name, { lower: true });
    const category = new Category({
      name,
      slug,
      image: uploadResponse.secure_url,
    });
    const savedCategory = await category.save();
    res.status(200).send(savedCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.fetchAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ _id: -1 });
    res.status(200).send(categories);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.fetchCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }
    
    const products = await Product.find({ category: category.slug });

    res.status(200).send({ category, products });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

exports.updateCategory = async (req, res) => {
  const { name, image } = req.body;
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (image) {
      // Destroy old image if it exists
      if (category.image) {
        await cloudinary.uploader.destroy(category.image);
      }
      // Upload new image
      const uploadResponse = await cloudinary.uploader.upload(image);
      category.image = uploadResponse.secure_url;
    }
    category.name = name;
    category.slug = slugify(name, { lower: true });
    const updatedCategory = await category.save();
    res.status(200).send(updatedCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ slug: req.params.slug });
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    } 
    // Optionally, we can still delete associated products
    // await Product.deleteMany({ category: category._id });

    res.status(200).send({ message: "Category deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
