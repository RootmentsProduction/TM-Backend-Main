const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, index: true },
    targetDate: { type: Date },
    status: { type: String, default: 'PENDING', index: true },
    payload: { type: String, default: '' },
    scheduledFor: { type: Date },
    attempt: { type: Number, default: 0 },
    lastError: { type: String, default: '' },
    spreadsheetId: { type: String, default: 'default', index: true },
    rowNumber: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
