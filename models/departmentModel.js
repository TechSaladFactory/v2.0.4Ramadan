const mongoose = require("mongoose")

const DepartmentShema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Department name must't be empty"],
        unique: [true, "This Department is already exists"],
        trim: true,
        minlength: [3 , "Department name is too short"],
        maxlength: [32, "Department name is too long"],
    },

    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true })

 exports.DepartmentModel = mongoose.model("Department", DepartmentShema)

