const mongoose=require("mongoose")
const DeliveryAppShema =mongoose.Schema({
 name: {
        type: String,
        required: [true, "name must't be empty"],
        trim: true,
        minlength: [1, " name is too short"],
    },
},{ timestamps: true })



exports.DeliveryAppModel=mongoose.model("DeliveryApp",DeliveryAppShema)