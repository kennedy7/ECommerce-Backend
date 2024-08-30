const Product = require("../models/product");
const Category = require("../models/category");
const { default: slugify } = require("slugify");

// Create a Product
exports.CreateProduct = async (req, res) => {
  const { name, desc, category, quantity, price, images } = req.body;

  try {
    // Check if category exists
    const categoryExists = await Category.findOne({ slug: category });
    if (!categoryExists) {
      return res.status(400).send("Category does not exist.");
    }

    if (images && images.length <= 4) {
      const slug = slugify(name, { lower: true });
      const product = new Product({
        name,
        slug,
        desc,
        category: categoryExists._id,
        quantity,
        price,
        images,  // Directly save the images array
      });

      const savedProduct = await product.save();
      res.status(200).send(savedProduct);
    } else {
      res.status(400).send("You can upload up to 4 images only.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// Fetch All Products
exports.fetchAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: 'category',
        select: 'name slug image',  // Select only the fields you want from the Category model
      })
      .sort({ _id: -1 });
    res.status(200).send(products);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// Fetch Single Product by Slug
exports.fetchProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate({ path: 'category' });

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.status(200).send(product);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// Search Product
exports.SearchProduct = async (req, res) => {
  try {
    const keyword = req.params.keyword;

    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { desc: { $regex: keyword, $options: "i" } },
      ],
    });
    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Update Product
exports.UpdateProduct = async (req, res) => {
  try {
    const { productImg, category } = req.body;

    // Find category ID if a category slug is provided
    let categoryId = null;
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        categoryId = categoryDoc._id;
      } else {
        return res.status(400).send("Category not found.");
      }
    }

    // Prepare the updated product body
    const updatedBody = {
      ...req.body,
      category: categoryId,
    };

    if (productImg && productImg.length <= 4) {
      // Update the product with new images and category ID
      const updatedProduct = await Product.findOneAndUpdate(
        { slug: req.params.slug },
        { $set: { ...updatedBody, images: productImg } },  // Directly save the images array
        { new: true }
      );
      res.status(200).send(updatedProduct);
    } else if (!productImg) {
      // If no new images, update other fields
      const updatedProduct = await Product.findOneAndUpdate(
        { slug: req.params.slug },
        { $set: { ...updatedBody } },
        { new: true }
      );
      res.status(200).send(updatedProduct);
    } else {
      res.status(400).send("You can upload up to 4 images only.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Delete Product
exports.DeleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }

    // Delete the product directly from the database
    const deletedProduct = await Product.findOneAndDelete({ slug: req.params.slug });
    res.status(200).send(deletedProduct);
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send({ message: 'Internal Server Error', error });
  }
};
