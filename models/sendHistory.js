// models/SendHistoryModel.js
const mongoose = require("mongoose");

const sendHistorySchema = new mongoose.Schema(
  {
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductOP",
          required: true,
        },
        qty: { type: Number, required: true },
      },
    ],
    userID:{
        type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAdmin: { type: Boolean, default: false }, 
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    isSend: { type: Boolean, default: false }, 
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    note: { type: String },
    sendType: { type: String },
  },
  { timestamps: true }
);

exports.SendHistoryModel  = mongoose.model("SendHistory", sendHistorySchema);
