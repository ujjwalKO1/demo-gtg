import mongoose from 'mongoose';

const HostCreditTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true // e.g., -1 for hosting, +1 for welcome or purchase
  },
  type: {
    type: String,
    enum: ['welcome_gift', 'event_host', 'attendance_reward', 'purchase'],
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.HostCreditTransaction || mongoose.model('HostCreditTransaction', HostCreditTransactionSchema);
