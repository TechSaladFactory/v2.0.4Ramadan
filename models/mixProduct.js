const mongoose = require("mongoose");

const mixProductSchema = new mongoose.Schema({
    product: {
        type: String,
        required: [true, "MixProduct name mustn't be empty"],
        unique: [true, "This MixProduct already exists"],      
        trim: true,
    },
    slug: {
        type: String,
        lowercase: true,
    },
    unit: {
        type:mongoose.Schema.Types.ObjectId,
        
        ref:"Unit"
    },
    carpo: {
        type: Number,
    },
    brotten: {
        type: Number,
    },
    dohon: {
        type: Number,
    }, qty: {
        type: Number,
    },
    alyaf: {
        type: Number,
    },
      calory: {
        type: Number,
        
    },
note:{
      type:String,
      trim:true,
      defult:null
    },    
  isKalta:{
      type:Boolean,
      default:false
    }


}, {
    timestamps: true
    , toJSON: { virtuals: true },
    toObject: { virtuals: true },});


mixProductSchema.virtual("caloryfor1gram").get(function () {
  if (!this.qty || this.qty === 0) return 0;
  return this.calory / this.qty;
});

mixProductSchema.virtual("carpoPerGram").get(function () {
  if (!this.qty || this.qty === 0) return 0;
  return this.carpo / this.qty;
});

mixProductSchema.virtual("proteinPerGram").get(function () {
  if (!this.qty || this.qty === 0) return 0;
  return this.brotten / this.qty;
});

mixProductSchema.virtual("alyafPerGram").get(function () {
  if (!this.qty || this.qty === 0) return 0;
  return this.alyaf / this.qty;
});

mixProductSchema.virtual("fatPerGram").get(function () {
  if (!this.qty || this.qty === 0) return 0;
  return this.dohon / this.qty;
});

exports.MixproductModel = mongoose.model("MixProduct", mixProductSchema);
