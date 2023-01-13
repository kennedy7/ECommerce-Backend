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
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  total: { type: Object, required: true },
});

module.exports = mongoose.model("Order", orderSchema);
