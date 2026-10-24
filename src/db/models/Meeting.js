const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    meetingNo: { type: Number, required: true, unique: true, index: true },
    date: { type: Date, required: true, index: true },
    theme: { type: String, default: '' },
    tmod: { type: String, default: '' },
    generalEvaluator: { type: String, default: '' },
    timer: { type: String, default: '' },
    ahCounter: { type: String, default: '' },
    grammarian: { type: String, default: '' },
    tableTopicsMaster: { type: String, default: '' },
    speakers: [
      {
        slot: { type: Number },
        name: { type: String, default: '' }
      }
    ],
    evaluators: [
      {
        slot: { type: Number },
        name: { type: String, default: '' }
      }
    ],
    status: { type: String, default: 'DRAFT', enum: ['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'] },
    notes: { type: String, default: '' },
    vpeHold: { type: String, default: '' },
    lock: { type: String, default: '' },
    spreadsheetId: { type: String, default: 'default', index: true },
    rowNumber: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', meetingSchema);
