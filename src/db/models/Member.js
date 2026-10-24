const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    whatsapp: { type: String, default: '', index: true },
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive', 'Guest'] },
    spreadsheetId: { type: String, default: 'default', index: true },
    rowNumber: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);
