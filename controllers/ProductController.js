const Product = require("../models/product");
const Category = require("../models/category");
const cloudinary = require("../utils/cloudinary");
const { default: slugify } = require("slugify");
   

exports.CreateProduct = async (req, res) => {

  const { name, desc, category, quantity, price, images } = req.body;

  try {
    // Check if category exists
    const categoryExists = await Category.findOne({ slug: category });
    if (!categoryExists) {
      return res.status(400).send("Category does not exist.");
    }

    if (images && images.length <= 4) {
      const uploadPromises = images.map(image => cloudinary.uploader.upload(image));
      const uploadResponses = await Promise.all(uploadPromises);

      const slug = slugify(name, { lower: true });
      const product = new Product({
        name,
        slug,
        desc,
        category: categoryExists._id, 
        quantity,
        price,
        images: uploadResponses.map(response => response.url),
       
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

exports.fetchAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.status(200).send(products);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

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

exports.SearchProduct = async (req, res) => {
  try {
    const keyword = req.params.keyword;

    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { desc: { $regex: keyword, $options: "i" } },
        { slug: { $regex: keyword, $options: "i" } },
      ],
    });
    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};



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
      category: categoryId, // Use the category ID instead of the slug
    };

    if (productImg && productImg.length <= 4) {
      // If there are new images to upload
      const product = await Product.findOne({ slug: req.params.slug });

      if (product && product.images) {
        // Destroy old images
        const destroyPromises = product.images.map(image => cloudinary.uploader.destroy(image.public_id));
        await Promise.all(destroyPromises);
      }

      // Upload new images
      const uploadPromises = productImg.map(image => cloudinary.uploader.upload(image));
      const uploadResponses = await Promise.all(uploadPromises);

      // Update the product with new images and category ID
      const updatedProduct = await Product.findOneAndUpdate(
        { slug: req.params.slug },
        { $set: { ...updatedBody, images: uploadResponses } },
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


exports.DeleteProduct = async (req, res) => {
  try {
    // Find the product by slug
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }

    // Delete images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      const destroyPromises = product.images.map(image => {
        if (image.public_id) {
          return cloudinary.uploader.destroy(image.public_id);
        } else {
          console.warn('Image does not have a public_id:', image);
          return Promise.resolve(); // Skip image without public_id
        }
      });
      await Promise.all(destroyPromises);
    }

    // Delete the product
    const deletedProduct = await Product.findOneAndDelete({ slug: req.params.slug });

    // Return the deleted product
    res.status(200).send(deletedProduct);
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send({ message: 'Internal Server Error', error });
  }
};


