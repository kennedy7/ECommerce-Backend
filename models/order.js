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

const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },  
  amount: { type: Number, required: true },  // Payment amount in kobo (smallest currency unit)
  reference: { type: String, required: true, unique: true },  // Paystack transaction reference
  status: { type: String, required: true },  // Payment status (e.g., 'pending', 'success', 'failed')
  paymentGateway: { type: String, default: 'Paystack' },  // The payment provider (defaults to Paystack)
  address: { type: String },  // Delivery address (extracted from metadata)
  deliveryStatus: { type: String, default: 'pending' },  // Delivery status (e.g., 'pending', 'shipped', 'delivered')
  paymentStatus: { type: String, default: 'pending' },  // Payment status (e.g., 'pending', 'paid', 'failed')
  metadata: { type: Object, default: {} },  // Stores additional information from Paystack
  createdAt: { type: Date, default: Date.now },  // Timestamp for when the order was created
  updatedAt: { type: Date, default: Date.now },  // Timestamp for when the order was last updated
});

// Middleware to automatically update the 'updatedAt' field
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to extract address, deliveryStatus, and paymentStatus from metadata
orderSchema.pre('save', function (next) {
  if (this.metadata) {
    this.address = this.metadata.address || this.address;
    this.deliveryStatus = this.metadata.deliveryStatus || this.deliveryStatus;
    this.paymentStatus = this.metadata.paymentStatus || this.paymentStatus;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
