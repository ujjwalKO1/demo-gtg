import Review from '../models/Review.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';

// @desc    Submit a review for an event organizer
// @route   POST /api/reviews
// @access  Private
export const submitReview = async (req, res, next) => {
  try {
    const { eventId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      res.statusCode = 400;
      throw new Error('Please provide a rating between 1 and 5 stars');
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.statusCode = 404;
      throw new Error('Event not found');
    }

    // Verify reviewer is not the organizer themselves
    if (event.organizer.toString() === reviewerId) {
      res.statusCode = 400;
      throw new Error('You cannot review your own hosting');
    }

    // Check if the user was approved to attend this event
    const joinReq = await JoinRequest.findOne({ event: eventId, user: reviewerId, status: 'approved' });
    if (!joinReq) {
      res.statusCode = 401;
      throw new Error('You can only review organizers for events you were approved to attend');
    }

    // Check if user already submitted a review
    const existingReview = await Review.findOne({ event: eventId, reviewer: reviewerId });
    if (existingReview) {
      res.statusCode = 400;
      throw new Error('You have already submitted a review for this event');
    }

    // Create the review
    const review = await Review.create({
      organizer: event.organizer,
      reviewer: reviewerId,
      event: eventId,
      rating,
      comment
    });

    // Update organizer's community reputation score
    const organizer = await User.findById(event.organizer);
    if (organizer) {
      if (rating >= 4) {
        organizer.communityScore += rating === 5 ? 15 : 8; // Grant score boost for good host feedback
      } else if (rating <= 2) {
        organizer.communityScore = Math.max(10, organizer.communityScore - 12); // Reduce score for bad host feedback
      }

      // Add a Host Milestone achievement if they cross score threshold
      if (organizer.communityScore >= 200 && !organizer.achievements.includes('Community Pillar')) {
        organizer.achievements.push('Community Pillar');
      }

      await organizer.save();
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review submitted.',
      review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews and stats for an organizer
// @route   GET /api/reviews/organizer/:userId
// @access  Public
export const getOrganizerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ organizer: req.params.userId })
      .populate('reviewer', 'name avatar isVerified verificationStatus')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    res.json({
      success: true,
      count: reviews.length,
      averageRating,
      reviews
    });
  } catch (error) {
    next(error);
  }
};
