import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isPresent: {
    type: Boolean,
    default: false
  },
  markedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a single attendance entry per user per event
AttendanceSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
