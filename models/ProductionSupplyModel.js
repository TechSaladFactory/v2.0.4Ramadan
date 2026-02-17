const mongoose = require("mongoose");

const productionSupplySchema = new mongoose.Schema({
  product: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductOP",
    default: null,
  }],
  qty: {
    type: Number,
    default: 0,
    min: [0, "Quantity cannot be negative"],
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true,
  },
}, { timestamps: true });

exports.productionSupplyModel = mongoose.model("ProductionSupply", productionSupplySchema);
