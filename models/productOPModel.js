const mongoose = require("mongoose")
const { ref } = require("pdfkit")

const ProductOPShema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique:[true,"roduct name is exits"],
        minlength: [1, "Product name is too short"],
        maxlength: [32, "Product name is too long"],
    },
    bracode: {
        type: String,
        required: [true, "Product bracode must't be empty"],
        unique: [true, "This bracode is already exists"],
        trim: true,
        minlength: [3, "Product bracode is too short"],
    },
    
    packageUnit:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Unit",
        default:null
    },
    packSize: {
        type: String,
        default: "",
        trim: true,
    },
  mainProductOP: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MainProduct_OP",
        default: null,
    },

    isorderProduction:{
        type:Boolean,
        default:false
    },
    isorderSupply:{
        type:Boolean,
        default:false
    },
    isTawalf:{
            type:Boolean,
            default:false
    },
    
    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true })

exports.productOPModel = mongoose.model("ProductOP", ProductOPShema)

