const mongoose = require("mongoose")

const MainProductShema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "MainProduct name must't be empty"],
        unique: [true, "This MainProduct is already exists"],
        trim: true,
        minlength: [1 , "MainProduct name is too short"],
        maxlength: [32, "MainProduct name is too long"],
    },

    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true })

 exports.MainProductModel= mongoose.model("MainProduct", MainProductShema)

