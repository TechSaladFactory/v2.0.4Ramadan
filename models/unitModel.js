const mongoose = require("mongoose")

const UnitShema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Unit name must't be empty"],
        unique: [true, "This Unit is already exists"],
        trim: true,
        minlength: [1, "Unit name is too short"],
        maxlength: [32, "Unit name is too long"],
    },
    Tawalf_productOP: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductOP",
            required: false,
            default: []
        }
    ],

    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true })

exports.UnitModel = mongoose.model("Unit", UnitShema)

