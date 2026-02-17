const mongoose = require("mongoose")

const MainProductOPShema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "MainProduct_OP name must't be empty"],
        unique: [true, "This MainProduct_OP is already exists"],
        trim: true,
        minlength: [1 , "MainProduct_OP name is too short"],
        maxlength: [32, "MainProduct _OP name is too long"],
    },
    order: {
        type: Number,
        default: 0,
      },
    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true })

 exports.MainProductOPModel= mongoose.model("MainProduct_OP", MainProductOPShema)

