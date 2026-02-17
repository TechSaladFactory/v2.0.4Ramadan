const mongoose = require('mongoose');


const FailedLoginSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  deviceName: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false }, // ✅ حقل جديد
}, { timestamps: true });


exports.FailedLoginModel = mongoose.model('FailedLogin', FailedLoginSchema);
