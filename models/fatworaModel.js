const mongoose = require("mongoose")

const fatworaShema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Fatwora name must't be empty"],
        unique: [true, "This Fatwora is already exists"],
        trim: true,
        minlength: [1 , "Fatwora name is too short"],
    },
    image: {
        type: String,
        required: [true, "Fatwora image must't be empty"],
        trim: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "UserId must't be empty"],
    }
    ,
    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true })

 exports.FatworaModel= mongoose.model("Fatwora", fatworaShema)

