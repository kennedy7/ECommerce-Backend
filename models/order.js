// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: String,
//       required: true,
//     },
//     customerId: {
//       type: String,
//     },
//     paymentIntentId: { type: String },
//     products: [],
//     subtotal: { type: Number, required: true },
//     total: { type: Number, required: true },
//     shipping: { type: Object, required: true },
//     deliveryStatus: { type: String, default: "pending" },
//     paymentStatus: { type: String, default: "pending", required: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Order", orderSchema);

const mongoose = require('mongoose');

// Define enums for payment status and delivery status
const paymentStatusEnum = ['pending', 'paid', 'failed'];
const deliveryStatusEnum = ['pending', 'shipped', 'delivered'];
const statusEnum = ['pending', 'completed', 'cancelled'];

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  products: {
    type: Array,
    required: true,
  },
  amount: {
    type: Number,
    required: true, 
  },
  address: {
    type: String,
    required: true,
  },
  //order status
  status: { 
    type: String, 
    enum: statusEnum, 
    default: 'pending' 
  },
  paymentStatus: {
    type: String,
    enum: paymentStatusEnum,
    default: 'pending',
  },
  deliveryStatus: {
    type: String,
    enum: deliveryStatusEnum,
    default: 'pending',
  },
  metadata: {
    type: Object,
    default: {},
    // Store additional metadata from Paystack
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
