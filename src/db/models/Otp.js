const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    clubId: { type: String, default: 'ATK', index: true },
    code: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: '5m' } }
  },
  { timestamps: true }
);

otpSchema.index({ phone: 1, clubId: 1 });

module.exports = mongoose.model('Otp', otpSchema);
