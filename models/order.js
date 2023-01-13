const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  products: [
    {
      id: { type: String },
      name: { type: String },
      brand: { type: String },
      desc: { type: String },
      price: { type: String },
      image: { type: String },
      cartQuantity: { type: Number },
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);
