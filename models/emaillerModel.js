const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")
const EmaillerSchema = new mongoose.Schema(
  {
    email:{
        type: String,
        lowercase: true,
        required:[true,"Email is required !"],
        trim:true,
    }
  },
  { timestamps: true }
);

exports.EmaillerModel = mongoose.model('Emailler', EmaillerSchema);;