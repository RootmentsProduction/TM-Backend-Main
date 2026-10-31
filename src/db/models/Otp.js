const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, index: true },
    phone: { type: String, index: true },
    clubId: { type: String, default: 'ATK', index: true },
    code: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    isUsed: { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, required: true, index: { expires: '10m' } }
  },
  { timestamps: true }
);

otpSchema.index({ phone: 1, clubId: 1 });
otpSchema.index({ email: 1, clubId: 1 });

module.exports = mongoose.model('Otp', otpSchema);

