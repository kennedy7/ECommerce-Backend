const Product = require("../models/product");
const cloudinary = require("../utils/cloudinary");

exports.CreateProduct = async (req, res) => {
  const { name, brand, desc, price, image } = req.body;
  try {
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      upload_preset: "online-Shop";
      if (uploadResponse) {
        const product = new Product({
          name,
          brand,
          desc,
          price,
          image: uploadResponse,
        });
        const savedProduct = await product.save();
        res.status(200).send(savedProduct);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.fetchProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(error);
  }
};
