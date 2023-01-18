const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
    },
    paymentIntentId: { type: String },
    products: [],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    shipping: { type: Object, required: true },
    deliveryStatus: { type: Object, default: "pending" },
    paymentStatus: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
