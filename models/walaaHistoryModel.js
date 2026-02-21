const mongoose = require("mongoose");

function generateRandomCode(length = 4) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

const WalaaHistorySchema = new mongoose.Schema({
  title: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, "Title is required"],
    validate: {
      validator: function (v) {
        return (typeof v === "string" && v.trim().length > 0) || mongoose.isValidObjectId(v);
      },
      message: "Title must be a non-empty string or a valid ObjectId",
    },
  },

  status: {
    type: String,
    required: [true, "Status is required"],
  },

  rate: {
    type: String,
    enum: ["+", "-"],
    default: "",
  },

  collect: {
    type: Boolean,
    default: false,
  },

  reson: {
    type: String,
    trim: true,
  },

  points: {
    type: Number,
    default: 0,
  },

  place: {
    type: String,
    enum: ["h", "r"],
    default: "r",
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  trxId: {
    type: String,
    unique: true,
    default: () =>
      `${Math.floor(100000 + Math.random() * 900000)}`
,
  },approved:{
  type:Boolean,
  default:false
}
}, { timestamps: true });

module.exports = mongoose.model("WalaaHistory", WalaaHistorySchema);
