import HostCreditTransaction from '../models/HostCreditTransaction.js';
import User from '../models/User.js';

// @desc    Purchase a host credit (Mock Payment ₹99)
// @route   POST /api/credits/purchase
// @access  Private
export const purchaseCredit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    // Mock payment validation - success by default
    user.hostCredits += 1;
    
    if (!user.achievements.includes('First Purchase')) {
      user.achievements.push('First Purchase');
    }

    await user.save();

    // Log the transaction
    const transaction = await HostCreditTransaction.create({
      user: user._id,
      amount: 1,
      type: 'purchase',
      details: 'Purchased 1 host credit via UPI/Card for ₹99'
    });

    res.json({
      success: true,
      message: 'Payment of ₹99 successful! 1 Host Credit added to your balance.',
      hostCredits: user.hostCredits,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all host credit transactions for current user
// @route   GET /api/credits/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await HostCreditTransaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    next(error);
  }
};
