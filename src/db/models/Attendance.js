const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    member_id: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, required: true, enum: ['present', 'absent', 'excused'] }
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true, index: true },
    clubId: { type: String, required: true, index: true },
    attendance: [attendanceRecordSchema],
    totalMarked: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
    absentCount: { type: Number, default: 0 },
    excusedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

attendanceSchema.index({ clubId: 1, meetingId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
