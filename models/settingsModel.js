const mongoose = require("mongoose")

const settingsShema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "name must't be empty"],
        trim: true,
        minlength: [1, " name is too short"],
    },
    des: {
        type: String,
        required: [true, "name must't be empty"],
        trim: true,
        minlength: [1, "name is too short"],
    },
    open: {
        type: Boolean,
        default:false
        },
   
}, { timestamps: true })

 exports.settingsModel = mongoose.model("Settings", settingsShema)

