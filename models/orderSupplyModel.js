const mongoose = require("mongoose");

const orderSupplyModelSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    default: null,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    default: null,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductOP",
    default: null,
  },
  mainProductOP: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MainProduct_OP",
    required: false,
    default: null,
  },
  packageUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
    required: false,
    // default: null,
  },
  package: {
    type: String,
    required: false,
    default: null,
  },
  qty: {
    type: Number,
    required: [true, "qty  required!"],
  },
  ordername: {
    type: String,
    default: "",
  },
  isSend:{
    type:Boolean,
    default:false
  }
}, { timestamps: true });

// Auto-generate name if not provided
orderSupplyModelSchema.pre("save", async function (next) {
  if (this.isNew && !this.name) {
    const Model = mongoose.model("orderSupply", orderSupplyModelSchema);
    const lastDoc = await Model.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastDoc && lastDoc.name && lastDoc.name.startsWith("عملية-")) {
      const parts = lastDoc.name.split("-");
      const numberPart = parseInt(parts[1]);
      if (!isNaN(numberPart)) {
        nextNumber = numberPart + 1;
      }
    }

    this.name = `عملية-${String(nextNumber).padStart(4, '0')}`;
  }

  next();
});

exports.orderSupplyModel = mongoose.model("orderSupply", orderSupplyModelSchema);
