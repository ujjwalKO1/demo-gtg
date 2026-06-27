import Attendance from '../models/Attendance.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import HostCreditTransaction from '../models/HostCreditTransaction.js';

// @desc    Get attendance list for a specific event
// @route   GET /api/attendance/event/:eventId
// @access  Private
export const getEventAttendance = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.statusCode = 404;
      throw new Error('Event not found');
    }

    // Authorization: User must be organizer OR an approved attendee of the event
    const isOrganizer = event.organizer.toString() === req.user.id;
    
    // Find attendance sheet
    const records = await Attendance.find({ event: req.params.eventId })
      .populate('user', 'name email phone avatar isVerified verificationStatus')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: records.length,
      attendance: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance for an event (Organizer only)
// @route   POST /api/attendance/event/:eventId
// @access  Private
export const markAttendance = async (req, res, next) => {
  try {
    const { attendeesList } = req.body; // Array of { userId: String, isPresent: Boolean }
    if (!Array.isArray(attendeesList)) {
      res.statusCode = 400;
      throw new Error('Please provide an attendees list array');
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.statusCode = 404;
      throw new Error('Event not found');
    }

    // Ensure logged-in user is event organizer
    if (event.organizer.toString() !== req.user.id) {
      res.statusCode = 401;
      throw new Error('Only the event organizer can mark attendance');
    }

    for (const record of attendeesList) {
      const { userId, isPresent } = record;

      // Find the current attendance status
      const existingRecord = await Attendance.findOne({ event: event._id, user: userId });
      if (!existingRecord) continue;

      const wasPresentBefore = existingRecord.isPresent;

      // Only perform logic if attendance state is changed
      if (wasPresentBefore !== isPresent) {
        existingRecord.isPresent = isPresent;
        existingRecord.markedBy = req.user.id;
        existingRecord.markedAt = Date.now();
        await existingRecord.save();

        // Find user to update progress
        const attendee = await User.findById(userId);
        if (attendee) {
          if (isPresent) {
            // Checked-in: Increment count & progression
            attendee.attendedEventsCount += 1;
            attendee.verifiedAttendanceForCredits += 1;

            // Trigger credit reward if progress is 5
            if (attendee.verifiedAttendanceForCredits >= 5) {
              attendee.verifiedAttendanceForCredits = 0; // Reset progress
              attendee.hostCredits += 1; // Award credit

              // Register achievements
              if (!attendee.achievements.includes('Frequent Goer')) {
                attendee.achievements.push('Frequent Goer');
              }

              // Log transaction
              await HostCreditTransaction.create({
                user: attendee._id,
                amount: 1,
                type: 'attendance_reward',
                details: 'Earned 1 host credit for attending 5 verified events'
              });
            }
          } else {
            // Checked-out (reverted check-in): Decrement count & progress
            attendee.attendedEventsCount = Math.max(0, attendee.attendedEventsCount - 1);
            attendee.verifiedAttendanceForCredits = Math.max(0, attendee.verifiedAttendanceForCredits - 1);
          }
          await attendee.save();
        }
      }
    }

    // Fetch updated list to return
    const updatedRecords = await Attendance.find({ event: event._id })
      .populate('user', 'name email phone avatar isVerified verificationStatus');

    res.json({
      success: true,
      message: 'Attendance saved successfully!',
      attendance: updatedRecords
    });
  } catch (error) {
    next(error);
  }
};
