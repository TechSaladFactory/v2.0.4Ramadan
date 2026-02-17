const mongoose = require("mongoose")

const SupplierShema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Supplier name must't be empty"],
        unique: [true, "This Supplier is already exists"],
        trim: true,
        minlength: [3 , "Supplier name is too short"],
        maxlength: [32, "Supplier name is too long"],
    },

    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true })

 exports.SupplierModel = mongoose.model("Supplier", SupplierShema)

