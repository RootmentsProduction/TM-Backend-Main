const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, index: true },
    value: { type: String, default: '' },
    spreadsheetId: { type: String, default: 'default', index: true }
  },
  { timestamps: true }
);

configSchema.index({ spreadsheetId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('AutomationConfig', configSchema);
