const mongoose = require("mongoose");

const productionHistorySchema = new mongoose.Schema({
  items: [
    {
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
   
    },
  ],
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: false,
  },
  isSend: {
    type: Boolean,
    required: true,
    default:false
  },
  action: {
    type: String,
    default: "create", // create أو update
  },
}, { timestamps: true });

exports.ProductionHistoryModel = mongoose.model("ProductionHistory", productionHistorySchema);
