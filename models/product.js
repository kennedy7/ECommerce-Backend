const mongoose = require("mongoose");
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    images: {
      type: [Object],
      required: true,
      validate: [arrayLimit, '{PATH} exceeds the limit of 4']
    },
    slug: {
      type: String,
      unique: true,
      required: true,
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
