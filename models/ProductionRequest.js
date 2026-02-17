const mongoose = require("mongoose");

const productionRequestSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductOP",
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 0,
  },
  approved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

exports.ProductionRequestModel = mongoose.model("ProductionRequest", productionRequestSchema);
