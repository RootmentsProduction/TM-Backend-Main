const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    submissionId: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: '', index: true },
    member: { type: String, default: '' },
    type: { type: String, default: '' },
    content: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    processed: { type: String, default: 'NO' },
    actionTaken: { type: String, default: '' },
    notes: { type: String, default: '' },
    spreadsheetId: { type: String, default: 'default', index: true },
    rowNumber: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
