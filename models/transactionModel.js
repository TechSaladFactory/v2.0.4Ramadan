const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false // في INEXIST ممكن يكون فاضي
  },
  type: {
    type: String,
    enum: ["IN", "OUT", "INEXIST"], // ✅ أضفنا INEXIST
    required: [true, "Transaction type is required"]
  },
  quantity: {
    type: Number,
  },
  price: {
    type: Number,
  },
  expiredDate: {
    type: String,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier"
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  packSize: {
    type: String,
    trim: true
  },
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

exports.TransactionModel = mongoose.model("Transaction", TransactionSchema);
