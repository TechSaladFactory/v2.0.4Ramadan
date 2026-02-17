const mongoose = require("mongoose");

const MixSchema = mongoose.Schema({
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
        required: true,
        default:0
      }
    }
  ],
   note:{
      type:String,
      trim:true,
      defult:null
    },}, {
  timestamps: true 
});

module.exports = mongoose.model("Mixed", MixSchema);
