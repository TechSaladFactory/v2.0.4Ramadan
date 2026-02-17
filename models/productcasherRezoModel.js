const mongoose = require("mongoose");

const productRezoSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      unique: [true, "Product name must be unique"],
      minlength: [2, "Product name must be at least 2 characters long"],
      maxlength: [500, "Product name must be at most 500 characters long"]
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price must be greater than or equal to 0"]
    }
  },
  { timestamps: true }
);

exports.productRezoModel = mongoose.model("productrezos", productRezoSchema);
