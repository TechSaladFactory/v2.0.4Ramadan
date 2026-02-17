const mongoose = require("mongoose");

const tawalfSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "product is required"],
      ref: "ProductOP",
    },
    qty: {
      type: Number,
      required: [true, "qty is required"],
    },
    unite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    image: {
      type: String,
      required: [true, "Tawalf image required"],
    },
    userId :{
        type:mongoose.Schema.Types.ObjectId,
        required:[true,"userID required"]
        ,ref:"User"
    },branch:{
      type:mongoose.Schema.Types.ObjectId,
      default:null,
      ref:"Branch"
    }
  },
  {
    timestamps: true,
  }
);

exports.TawalfModel = mongoose.model("TawalfHistory", tawalfSchema);
