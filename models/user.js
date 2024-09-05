const { boolean } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 200,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 1000,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    phoneNumber: { 
      type: String, 
      trim: true 
    }, // Added phone number field
  address: { 
    type: String, 
    trim: true 
  }, 
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
