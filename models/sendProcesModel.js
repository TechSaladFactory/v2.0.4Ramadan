const mongoose = require("mongoose");

const sendprocessHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: false,
      default:null
    },
    typeProcess: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    relatedHistory: {
      type: mongoose.Schema.ObjectId,
      required: true,
      refPath: "modelType",
    },
    modelType: {
      type: String,
      required: true,
      enum: ["ProductionHistory", "ProductionSupplyHistory"],
    },
    locationProcess: {
      type: String,
      default: "",
    },

    // ✅ تفاصيل التعديلات
    changes: [
      {
        productId: { type: mongoose.Schema.ObjectId, ref: "ProductOP" },
        productName: String,
        oldQty: Number,
        newQty: Number,
        diff: Number,
      },
    ],
  },
  { timestamps: true }
);
exports.SendProcessHistoryModel = mongoose.model("SendProcessHistory", sendprocessHistorySchema);
