import mongoose from 'mongoose';

const JoinRequestSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only request to join a specific event once
JoinRequestSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.models.JoinRequest || mongoose.model('JoinRequest', JoinRequestSchema);
