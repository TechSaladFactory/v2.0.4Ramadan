const mongoose = require("mongoose");

const MissionSchema = mongoose.Schema({
    info: {
        type: String,
        trim: true,
        required: [true, "info required"],
        unique: [true, "This mission is already exists"],

    }
    ,department:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Mission", MissionSchema);
