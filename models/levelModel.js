const mongoose = require("mongoose");

const LevelSchema=mongoose.Schema({

    levelName:{
        type:String,
        trim:true,
    unique: [true, "This levelname already exists"],
        required: [true, "LevelName required"],

    },
    levelPoint:{
        type:Number,
        required: [true, "LevelName required"],

    }
},{
timestamps:true
})

module.exports = mongoose.model("level", LevelSchema);
