const mongoose = require('mongoose');

const outboxSchema = new mongoose.Schema(
  {
    outboxId: { type: String, required: true, unique: true, index: true },
    member: { type: String, default: '' },
    phone: { type: String, default: '', index: true },
    kind: { type: String, default: '' },
    status: { type: String, default: 'QUEUED', index: true },
    text: { type: String, default: '' },
    state: { type: String, default: '' },
    result: { type: String, default: '' },
    meetingNo: { type: Number, index: true },
    key: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    spreadsheetId: { type: String, default: 'default', index: true },
    rowNumber: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Outbox', outboxSchema);
