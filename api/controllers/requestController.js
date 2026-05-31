import JoinRequest from '../models/JoinRequest.js';
import Event from '../models/Event.js';
import Attendance from '../models/Attendance.js';

// @desc    Submit a request to join an event
// @route   POST /api/requests
// @access  Private
export const submitRequest = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      res.statusCode = 404;
      throw new Error('Event not found');
    }

    // Check if user is the organizer
    if (event.organizer.toString() === userId) {
      res.statusCode = 400;
      throw new Error('You cannot request to join your own event');
    }

    // Check if event is full
    if (event.spotsLeft <= 0) {
      res.statusCode = 400;
      throw new Error('This event is already full');
    }

    // Check for existing request
    const existingRequest = await JoinRequest.findOne({ event: eventId, user: userId });
    if (existingRequest) {
      res.statusCode = 400;
      throw new Error(`You have already submitted a request for this event (Status: ${existingRequest.status})`);
    }

    // Determine initial status based on organizer requireApproval flag
    const status = event.requireApproval ? 'pending' : 'approved';

    const joinRequest = await JoinRequest.create({
      event: eventId,
      user: userId,
      status
    });

    if (status === 'approved') {
      // Decrement spots left on event
      event.spotsLeft -= 1;
      await event.save();

      // Create attendance shell for checking-in later
      await Attendance.create({
        event: eventId,
        user: userId,
        isPresent: false,
        markedBy: event.organizer
      });
    }

    res.status(201).json({
      success: true,
      message: status === 'approved' 
        ? 'Successfully joined event! WhatsApp link is now unlocked.' 
        : 'Request sent! Waiting for organizer approval.',
      joinRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests for a specific event (Organizer only)
// @route   GET /api/requests/event/:eventId
// @access  Private
export const getEventRequests = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.statusCode = 404;
      throw new Error('Event not found');
    }

    // Ensure logged-in user is organizer
    if (event.organizer.toString() !== req.user.id) {
      res.statusCode = 401;
      throw new Error('Not authorized to view requests for this event');
    }

    const requests = await JoinRequest.find({ event: req.params.eventId })
      .populate('user', 'name email phone avatar isVerified verificationStatus')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a join request
// @route   PUT /api/requests/:id
// @access  Private
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      res.statusCode = 400;
      throw new Error('Invalid status. Must be approved or rejected');
    }

    const joinRequest = await JoinRequest.findById(req.params.id).populate('event');
    if (!joinRequest) {
      res.statusCode = 404;
      throw new Error('Join request not found');
    }

    const event = joinRequest.event;

    // Ensure logged-in user is event organizer
    if (event.organizer.toString() !== req.user.id) {
      res.statusCode = 401;
      throw new Error('Not authorized to manage requests for this event');
    }

    // If already has this status, just return it
    if (joinRequest.status === status) {
      return res.json({ success: true, joinRequest });
    }

    const oldStatus = joinRequest.status;

    if (status === 'approved') {
      // Check if event is full
      if (event.spotsLeft <= 0) {
        res.statusCode = 400;
        throw new Error('Cannot approve. Event is full!');
      }

      // Update request status
      joinRequest.status = 'approved';
      await joinRequest.save();

      // Decrement spots
      event.spotsLeft -= 1;
      await event.save();

      // Generate attendance sheet
      await Attendance.findOneAndUpdate(
        { event: event._id, user: joinRequest.user },
        { isPresent: false, markedBy: event.organizer },
        { upsert: true, new: true }
      );
    } else if (status === 'rejected') {
      joinRequest.status = 'rejected';
      await joinRequest.save();

      // If reverting from approved to rejected, restore spot and remove attendance sheet
      if (oldStatus === 'approved') {
        event.spotsLeft += 1;
        await event.save();

        await Attendance.findOneAndDelete({ event: event._id, user: joinRequest.user });
      }
    }

    res.json({
      success: true,
      message: `Request status updated to ${status}`,
      joinRequest
    });
  } catch (error) {
    next(error);
  }
};
