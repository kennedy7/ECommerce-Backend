const Product = require("../models/product");
const cloudinary = require("../utils/cloudinary");

   

exports.CreateProduct = async (req, res) => {
  const { name, brand, desc, category, price, images } = req.body;

  try {
    // Check if category exists
    const categoryExists = await Category.findOne({ slug: category });
    if (!categoryExists) {
      return res.status(400).send("Category does not exist.");
    }

    if (images && images.length <= 4) {
      const uploadPromises = images.map(image => cloudinary.uploader.upload(image));
      const uploadResponses = await Promise.all(uploadPromises);

      const product = new Product({
        name,
        brand,
        desc,
        category: categoryExists.slug, 
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

exports.SearchProduct = async (req, res) => {
  try {
    const keyword = req.params.keyword;

    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
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
    const product = await Product.findOne({ slug: req.params.slug });
    res.status(200).send(product);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.UpdateProduct = async (req, res) => {
  try {
    const { productImg } = req.body;

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

      const updatedProduct = await Product.findOneAndUpdate(
        { slug: req.params.slug },
        { $set: { ...req.body, images: uploadResponses } },
        { new: true }
      );
      res.status(200).send(updatedProduct);
    } else if (!productImg) {
      // If no new images, update other fields
      const updatedProduct = await Product.findOneAndUpdate(
        { slug: req.params.slug },
        { $set: { ...req.body } },
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
    const product = await Product.findOne({ slug: req.params.slug });

    if (product && product.images) {
      // Delete images from Cloudinary if they exist
      const destroyPromises = product.images.map(image => cloudinary.uploader.destroy(image.public_id));
      await Promise.all(destroyPromises);
    }

    const deletedProduct = await Product.findOneAndDelete({ slug: req.params.slug });
    res.status(200).send(deletedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
