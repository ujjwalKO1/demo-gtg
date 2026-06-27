import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Sports', 'Tech', 'Social', 'Food', 'Music', 'Art', 'Study', 'Gaming', 'Other']
  },
  coverImage: {
    type: String,
    default: ''
  },
  dateTime: {
    type: Date,
    required: [true, 'Please add a date and time']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please add a location address']
    },
    latitude: {
      type: Number,
      required: [true, 'Please add latitude']
    },
    longitude: {
      type: Number,
      required: [true, 'Please add longitude']
    }
  },
  participantLimit: {
    type: Number,
    required: [true, 'Please add a participant limit'],
    min: [2, 'Participant limit must be at least 2']
  },
  whatsappLink: {
    type: String,
    required: [true, 'Please add a WhatsApp invite link'],
    match: [
      /^(https?:\/\/)?(chat\.whatsapp\.com\/[a-zA-Z0-9]+)$/,
      'Please add a valid WhatsApp group invite link (e.g., chat.whatsapp.com/...)'
    ]
  },
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  spotsLeft: {
    type: Number,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate distance static method (Haversine formula) for nearby events query
EventSchema.statics.getNearby = function (latitude, longitude, maxDistanceKm) {
  // Let the client do distance logic in JS, or write custom MongoDB aggregation.
  // We will expose a query filter on lat/long.
};

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
