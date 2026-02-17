const mongoose = require("mongoose");

const finalMixedSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Mixed name required 1"],
    unique: [true, "This MixProduct already exists"],
  },
  productMixed: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MixProduct",
      },
      Qty: {
        type: Number,
        default: 0
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model("finalMixed", finalMixedSchema);
