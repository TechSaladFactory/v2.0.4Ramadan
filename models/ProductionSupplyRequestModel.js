const mongoose = require("mongoose");

const productionSupplyRequestSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductOP",
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  approved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

exports.productionSupplyRequestModel = mongoose.model("ProductionSupplyRequest", productionSupplyRequestSchema);
