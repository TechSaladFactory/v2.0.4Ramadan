const mongoose = require("mongoose");

const rezoSchema = mongoose.Schema({

    item: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "productrezos",
                required: true
            },
            qty: {
                type: Number,
                required: [true, "Qty is required"],
                min: [1, "Qty must be at least 1"],
                validate: {
                    validator: Number.isInteger,
                    message: "Qty must be an integer"
                }
            }
        }
    ],

    image: {
        type: String,   
        default: null
    },

    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    },

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    deliveryApp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryApp"
    }

}, { timestamps: true });

exports.RezoCasherModel = mongoose.model("RezoCasher", rezoSchema);
