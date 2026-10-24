const mongoose = require('mongoose');

const sheetStoreSchema = new mongoose.Schema(
  {
    spreadsheetId: { type: String, required: true, index: true },
    sheetName: { type: String, required: true, index: true },
    grid: { type: [[mongoose.Schema.Types.Mixed]], default: [] },
    rowCount: { type: Number, default: 0 },
    columnCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

sheetStoreSchema.index({ spreadsheetId: 1, sheetName: 1 }, { unique: true });

module.exports = mongoose.model('SheetStore', sheetStoreSchema);
