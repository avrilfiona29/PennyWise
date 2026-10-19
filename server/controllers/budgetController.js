import User from '../models/User.js';

// ── PUT /api/transactions/budget ──────────────────────────────────────────

/**
 * Update the authenticated user's monthly spending limit.
 *
 * Blueprint §8 — Budget Route.
 * The budget is a non-negative number (0 means "no budget set").
 * Ownership is implicit: we update req.user._id, sourced from the JWT.
 */
export const updateBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;

    if (monthlyBudget === undefined || monthlyBudget === null || monthlyBudget === '') {
      return res.status(400).json({ message: 'monthlyBudget is required' });
    }

    const n = Number(monthlyBudget);

    if (!Number.isFinite(n) || n < 0) {
      return res.status(400).json({
        message: 'monthlyBudget must be a non-negative number',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { monthlyBudget: n } },
      { new: true, runValidators: true },
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Monthly budget updated',
      monthlyBudget: user.monthlyBudget,
    });
  } catch (err) {
    console.error('updateBudget error:', err.message);
    return res.status(500).json({ message: 'Server error updating budget' });
  }
};
