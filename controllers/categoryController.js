const Category = require("../models/category");
const cloudinary = require("../utils/cloudinary");

exports.createCategory = async (req, res) => {
  const { name, image } = req.body;
  try {
    const uploadResponse = await cloudinary.uploader.upload(image);
    const category = new Category({
      name,
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
    res.status(200).send(category);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
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
    const category = await Category.findOne({ slug: req.params.slug });
    if (category.image) {
      // Delete image from Cloudinary if it exists
      await cloudinary.uploader.destroy(category.image);
    }
    const deletedCategory = await Category.findOneAndDelete({ slug: req.params.slug });
    res.status(200).send(deletedCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
