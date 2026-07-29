import Event from '../models/Event.js';
import User from '../models/User.js';
import HostCreditTransaction from '../models/HostCreditTransaction.js';
import JoinRequest from '../models/JoinRequest.js';
import jwt from 'jsonwebtoken';

// Haversine distance formula in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const { search, category, lat, lng, radius } = req.query;
    
    // Construct base query
    const query = { isPublished: true };

    // Text search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    let events = await Event.find(query)
      .populate('organizer', 'name avatar isVerified verificationStatus communityScore')
      .sort({ dateTime: 1 });

    // Location/Proximity filter
    if (lat && lng && radius) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const searchRadius = parseFloat(radius); // in km

      events = events.filter((event) => {
        const eventLat = event.location.latitude;
        const eventLng = event.location.longitude;
        const dist = calculateDistance(userLat, userLng, eventLat, eventLng);
        
        // Attach computed distance to temporary response objects
        event._doc.distance = Math.round(dist * 10) / 10; // Round to 1 decimal place
        return dist <= searchRadius;
      });
    } else {
      // Default dummy distance for presentation if geolocation isn't active
      events = events.map(event => {
        event._doc.distance = null;
        return event;
      });
    }

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name bio avatar isVerified verificationStatus communityScore achievements');

    if (!event) {
      res.statusCode = 404;
      throw new Error('Event not found');
    }

    // Find other attendees (approved join requests)
    const approvedRequests = await JoinRequest.find({
      event: event._id,
      status: 'approved'
    }).populate('user', 'name avatar isVerified verificationStatus');

    const attendees = approvedRequests.map(req => req.user);

    // Verify if current requester has an active join request
    let userRequestStatus = null;
    let userRequestId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const joinRequest = await JoinRequest.findOne({ event: event._id, user: decoded.id });
        if (joinRequest) {
          userRequestStatus = joinRequest.status;
          userRequestId = joinRequest._id;
        }
      } catch (err) {
        // Token invalid, ignore silently for public detail check
      }
    }

    res.json({
      success: true,
      event,
      attendees,
      userRequestStatus,
      userRequestId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create and publish a new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    // Check host credits
    if (user.hostCredits < 3) {
      res.statusCode = 400;
      throw new Error('Insufficient host credits. You need 3 credits to host an event.');
    }

    const {
      title,
      description,
      category,
      coverImage,
      dateTime,
      location,
      participantLimit,
      whatsappLink,
      requireApproval
    } = req.body;

    // Deduct 3 credits
    user.hostCredits -= 3;
    await user.save();

    // Create event
    const event = await Event.create({
      title,
      description,
      category,
      coverImage: coverImage || `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80`, // fallback default event cover
      dateTime,
      location,
      participantLimit,
      whatsappLink,
      organizer: user._id,
      spotsLeft: participantLimit,
      requireApproval: requireApproval !== undefined ? requireApproval : true
    });

    // Add event to user's hosted list
    user.eventsHosted.push(event._id);
    await user.save();

    // Record credit transaction
    await HostCreditTransaction.create({
      user: user._id,
      amount: -3,
      type: 'event_host',
      details: `Spent 3 credits to host event: "${title}"`
    });

    res.status(201).json({
      success: true,
      message: 'Event created and published successfully!',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event details
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      res.statusCode = 404;
      throw new Error('Event not found');
    }

    // Ensure user is the event organizer
    if (event.organizer.toString() !== req.user.id) {
      res.statusCode = 401;
      throw new Error('User not authorized to edit this event');
    }

    // Capture limit change to adjust spotsLeft
    if (req.body.participantLimit) {
      const activeReservations = event.participantLimit - event.spotsLeft;
      if (req.body.participantLimit < activeReservations) {
        res.statusCode = 400;
        throw new Error(`Limit cannot be less than already approved attendees (${activeReservations})`);
      }
      req.body.spotsLeft = req.body.participantLimit - activeReservations;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Event updated successfully!',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.statusCode = 404;
      throw new Error('Event not found');
    }

    // Ensure user is the event organizer
    if (event.organizer.toString() !== req.user.id) {
      res.statusCode = 401;
      throw new Error('User not authorized to delete this event');
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
