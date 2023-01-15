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
        req.statusCode(200);
        console.log(savedProduct).send(savedProduct);
      }
    }
  } catch (err) {}
  console.log(err);
  res.status(500).send(err);
};

exports.fetchProducts = async (req, res) => {
  const products = await Product.find();
  res.status(200).send(products);
};
