const mongoose = require("mongoose")
const { ref } = require("pdfkit")

const ProductShema = mongoose.Schema({
    name: {
        type: String,
        // required: [true, "Product name must't be empty"],
        // unique: [false, "This Product is already exists"],
        // trim: true,
        default: null,
        // minlength: [1, "Product name is too short"],
        // maxlength: [32, "Product name is too long"],
    },
    bracode: {
        type: String,
        required: [true, "Product bracode must't be empty"],
        unique: [true, "This bracode is already exists"],
        trim: true,
        minlength: [3, "Product bracode is too short"],
    },
    availableQuantity: {
        type: Number,
        // required: [true, "Product availableQuantity must't be empty"],
        trim: true,
        default: 0
    },
    minQuantity: {
        type: Number,
        trim: true,
        default: 0
    },
    unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        // required: true
        default: null,

    },
    supplierAccepted: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        default: null,

        // required: true
    },
    packSize: {
        type: String,
        default: " ",
        trim: true,
    },


    updated: [
        {
            expireDate: {
                type: Date,
                required: false,

            },
            quantity: {
                type: Number,
                required: false,
                 min: [0, "Quantity must be at least 1"],
                default:0
                //
            },
            priceIN: {
                type: Number,
                required: false,

            },
        }
    ],

    price: {
        type: Number,
        // required: [true, "Product price must't be empty"],
        required: false,
        trim: true,
        default: 0
    },
    mainProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MainProduct",
        default: null,
    },
    isorderProduction:{
        type:Boolean,
        default:false
    },
    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true })

exports.productModel = mongoose.model("Product", ProductShema)

