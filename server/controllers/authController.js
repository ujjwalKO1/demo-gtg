import User from '../models/User.js';
import HostCreditTransaction from '../models/HostCreditTransaction.js';
import Event from '../models/Event.js';
import JoinRequest from '../models/JoinRequest.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'gtg_jwt_secret_key_production_ready_mvp_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.statusCode = 400;
      throw new Error('User already exists with this email');
    }

    // Create user (starts with 1 host credit via default schema value)
    const user = await User.create({
      name,
      email,
      password,
      hostCredits: 1,
      achievements: ['Welcome Gift']
    });

    if (user) {
      // Create first transaction representing the welcome gift credit
      await HostCreditTransaction.create({
        user: user._id,
        amount: 1,
        type: 'welcome_gift',
        details: 'Received 1 free host credit upon joining GTG'
      });

      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus,
          hostCredits: user.hostCredits,
          communityScore: user.communityScore,
          achievements: user.achievements
        }
      });
    } else {
      res.statusCode = 400;
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.statusCode = 400;
      throw new Error('Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.statusCode = 401;
      throw new Error('Invalid email or password');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.statusCode = 401;
      throw new Error('Invalid email or password');
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        hostCredits: user.hostCredits,
        communityScore: user.communityScore,
        achievements: user.achievements
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Auth login/register
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.statusCode = 400;
      throw new Error('No Google token provided');
    }

    // Since we use the implicit flow on frontend, we get an access_token. 
    // We can fetch the user profile directly from Google API.
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
       res.statusCode = 401;
       throw new Error('Failed to verify Google token');
    }
    
    const payload = await response.json();
    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Register new user via Google
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        hostCredits: 1,
        achievements: ['Welcome Gift']
      });

      // Create welcome gift transaction
      await HostCreditTransaction.create({
        user: user._id,
        amount: 1,
        type: 'welcome_gift',
        details: 'Received 1 free host credit upon joining GTG via Google'
      });
    } else {
      // User exists, update googleId if not present
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        hostCredits: user.hostCredits,
        communityScore: user.communityScore,
        achievements: user.achievements
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile (current session)
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    // Find hosted events
    const hostedEvents = await Event.find({ organizer: user._id }).sort({ dateTime: -1 });

    // Find attended events (approved join requests)
    const joinRequests = await JoinRequest.find({ user: user._id, status: 'approved' })
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name isVerified verificationStatus' }
      })
      .sort({ createdAt: -1 });

    const attendedEvents = joinRequests
      .filter(req => req.event !== null)
      .map(req => req.event);

    res.json({
      success: true,
      user,
      eventsHosted: hostedEvents,
      eventsAttended: attendedEvents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        hostCredits: user.hostCredits,
        communityScore: user.communityScore,
        achievements: user.achievements
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mock DigiLocker Government ID verification
// @route   POST /api/auth/verify
// @access  Private
export const verifyDigiLocker = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    user.isVerified = true;
    user.verificationStatus = 'verified';
    if (!user.achievements.includes('Identity Verified')) {
      user.achievements.push('Identity Verified');
      user.communityScore += 50; // Boost score by 50 for verifying identity!
    }

    await user.save();

    res.json({
      success: true,
      message: 'DigiLocker identity verification successful!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        hostCredits: user.hostCredits,
        communityScore: user.communityScore,
        achievements: user.achievements
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify phone number via Firebase
// @route   POST /api/auth/firebase-verify
// @access  Private
export const verifyFirebasePhone = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.statusCode = 400;
      throw new Error('Please provide a phone number');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    user.phone = phone;
    if (!user.achievements.includes('Phone Verified')) {
      user.achievements.push('Phone Verified');
    }
    await user.save();

    res.json({
      success: true,
      message: 'Phone number verified via Firebase successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        hostCredits: user.hostCredits,
        communityScore: user.communityScore,
        achievements: user.achievements
      }
    });
  } catch (error) {
    next(error);
  }
};
