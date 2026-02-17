const mongoose = require("mongoose")

const branchShema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Branch name must't be empty"],
        unique: [true, "This Branch is already exists"],
        trim: true,
        minlength: [2 , "Branch name is too short"],
        maxlength: [32, "Branch name is too long"],
    },
    product:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductOP",
        default: null,    }],
        productTawalf:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductOP",
            default: null,    }],

    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true })

 exports.BranchModel = mongoose.model("Branch", branchShema)

