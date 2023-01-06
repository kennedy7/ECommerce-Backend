const express = require("express");
const ProductRouter = express.Router();
const products = require("../products");

ProductRouter.get("/products", (req, res) => {
  res.send(products);
});

module.exports = ProductRouter;
