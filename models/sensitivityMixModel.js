const mongoose = require("mongoose");

const sensitivityMixPSchema = mongoose.Schema({

    name: {
        type: String,
        trim: true,
        required:[true,"sensitivity name is required !"]
    },
    p_Mix_primary: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MixProduct"

        }
    ],
  
  

}, { timestamps: true })

exports.SensitivityMixModel = mongoose.model("SensitivityMixP", sensitivityMixPSchema);
