const mongoose = require("mongoose");
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
   
    desc: {
      type: String,
      required: true,
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    },
    quantity: {
      type: Number,
      required: true,
      min: 0, 
    },
    price: {
      type: Number,
      required: true,
    },
    images: {
      type: [Object],
      required: true,
      validate: [arrayLimit, '{PATH} exceeds the limit of 4']
    },
   
    status: {
      type: String,
      enum: ['in stock', 'out of stock'],
      default: 'in stock',
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length <= 4;
}
ProductSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});


module.exports = mongoose.model("Product", ProductSchema);
