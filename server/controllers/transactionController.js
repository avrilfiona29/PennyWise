import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import {
  validateAmount,
  validateCategory,
  TRANSACTION_TYPES,
  currentMonthBounds,
} from '../utils/validators.js';

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Validate the common fields shared by create and update operations.
 * Returns an array of error strings (empty means valid).
 *
 * @param {object} fields
 * @param {boolean} requireAll - true for create, false for update (partial)
 */
const validateTransactionFields = (fields, requireAll = true) => {
  const errors = [];
  const { type, title, amount, category, date } = fields;

  if (requireAll || type !== undefined) {
    if (!type) errors.push('type is required');
    else if (!TRANSACTION_TYPES.includes(type)) errors.push('type must be income or expense');
  }

  if (requireAll || title !== undefined) {
    if (!title || String(title).trim() === '') errors.push('title is required');
    else if (String(title).trim().length > 100) errors.push('title must not exceed 100 characters');
  }

  if (requireAll || amount !== undefined) {
    const amtErr = validateAmount(amount);
    if (amtErr) errors.push(amtErr);
  }

  if (requireAll || category !== undefined) {
    if (!category) {
      errors.push('category is required');
    } else {
      // Cross-field category validation — need the resolved type
      const resolvedType = type;
      if (resolvedType) {
        const catErr = validateCategory(resolvedType, category);
        if (catErr) errors.push(catErr);
      }
    }
  }

  if (requireAll || date !== undefined) {
    if (!date) {
      errors.push('date is required');
    } else {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) errors.push('date is not a valid date');
    }
  }

  return errors;
};

// ── GET /api/transactions ─────────────────────────────────────────────────

/**
 * Return all transactions for the authenticated user.
 * Supports optional ?type and ?category query filters.
 * Sorted newest-first.
 */
export const getTransactions = async (req, res) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.type) {
      if (!TRANSACTION_TYPES.includes(req.query.type)) {
        return res.status(400).json({ message: 'type filter must be income or expense' });
      }
      filter.type = req.query.type;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    return res.status(200).json({ transactions });
  } catch (err) {
    console.error('getTransactions error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving transactions' });
  }
};

// ── POST /api/transactions ────────────────────────────────────────────────

/**
 * Create a new transaction for the authenticated user.
 * The user field is set from req.user._id — never from the request body.
 */
export const createTransaction = async (req, res) => {
  try {
    const { type, title, amount, category, date, notes } = req.body;

    const errors = validateTransactionFields({ type, title, amount, category, date }, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const transaction = await Transaction.create({
      user: req.user._id,   // always from verified token
      type,
      title: String(title).trim(),
      amount: Number(amount),
      category,
      date: new Date(date),
      notes: notes ? String(notes).trim() : '',
    });

    return res.status(201).json({ transaction });
  } catch (err) {
    console.error('createTransaction error:', err.message);
    return res.status(500).json({ message: 'Server error creating transaction' });
  }
};

// ── PUT /api/transactions/:id ─────────────────────────────────────────────

/**
 * Update a transaction that belongs to the authenticated user.
 * Ownership is enforced by including user: req.user._id in the query.
 * Returns 404 for both "not found" and "not owned" (no information leak).
 */
export const updateTransaction = async (req, res) => {
  try {
    const { type, title, amount, category, date, notes } = req.body;

    // Validate only the fields that were actually supplied (partial update).
    const errors = validateTransactionFields({ type, title, amount, category, date }, false);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    // Find the transaction first so we can do cross-field category validation
    // with the resolved type (which may come from the existing document if not
    // being updated).
    const existing = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // ── Cross-field type/category validation ─────────────────────────────
    // Resolve whichever side of the pair was NOT supplied from the existing
    // document, then validate the combination.
    //
    // Four cases:
    //  1. type + category both supplied  → validate supplied pair.
    //  2. type only                      → validate existing category against
    //                                      new type (this was the F-02 gap).
    //  3. category only                  → validate new category against
    //                                      existing type.
    //  4. neither supplied               → existing combination is already
    //                                      valid; nothing to check.
    const effectiveType     = type     ?? existing.type;
    const effectiveCategory = category ?? existing.category;

    if (type !== undefined || category !== undefined) {
      // At least one side changed — re-validate the resolved pair.
      const catErr = validateCategory(effectiveType, effectiveCategory);
      if (catErr) return res.status(400).json({ message: catErr });
    }

    // Build update object from only the fields provided.
    const updates = {};
    if (type      !== undefined) updates.type     = type;
    if (title     !== undefined) updates.title    = String(title).trim();
    if (amount    !== undefined) updates.amount   = Number(amount);
    if (category  !== undefined) updates.category = category;
    if (date      !== undefined) updates.date     = new Date(date);
    if (notes     !== undefined) updates.notes    = String(notes).trim();

    const updated = await Transaction.findByIdAndUpdate(
      existing._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    return res.status(200).json({ transaction: updated });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    console.error('updateTransaction error:', err.message);
    return res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// ── DELETE /api/transactions/:id ──────────────────────────────────────────

/**
 * Delete a transaction that belongs to the authenticated user.
 * Ownership enforced by filtering on both _id and user.
 */
export const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    console.error('deleteTransaction error:', err.message);
    return res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

// ── GET /api/transactions/summary ────────────────────────────────────────

/**
 * Return dashboard financial summaries for the authenticated user.
 *
 * Uses MongoDB aggregation (blueprint §6.2) for all totals — not JS loops.
 *
 * Response shape (blueprint §8):
 * {
 *   allTime: { income, expenses, balance },
 *   monthly: { income, expenses, budget, remaining, categoryBreakdown }
 * }
 *
 * Date boundary note: month boundaries are calculated in UTC to match the
 * UTC timestamps MongoDB stores, preventing off-by-one-day errors.
 */
export const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { start: monthStart, end: monthEnd } = currentMonthBounds();

    // ── All-time aggregation ─────────────────────────────────────────────
    const allTimeAgg = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const allTimeIncome   = allTimeAgg.find(r => r._id === 'income')?.total  ?? 0;
    const allTimeExpenses = allTimeAgg.find(r => r._id === 'expense')?.total ?? 0;

    // ── Monthly aggregation ──────────────────────────────────────────────
    const monthlyAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: monthStart, $lt: monthEnd },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const monthlyIncome   = monthlyAgg.find(r => r._id === 'income')?.total  ?? 0;
    const monthlyExpenses = monthlyAgg.find(r => r._id === 'expense')?.total ?? 0;

    // ── Category breakdown (current-month expenses only) ─────────────────
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: monthStart, $lt: monthEnd },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categoryBreakdown = categoryAgg.map(r => ({
      category: r._id,
      total: r.total,
    }));

    // ── Budget calculations ──────────────────────────────────────────────
    const budget    = req.user.monthlyBudget ?? 5000;
    const remaining = budget - monthlyExpenses;

    return res.status(200).json({
      allTime: {
        income:   allTimeIncome,
        expenses: allTimeExpenses,
        balance:  allTimeIncome - allTimeExpenses,
      },
      monthly: {
        income:            monthlyIncome,
        expenses:          monthlyExpenses,
        budget,
        remaining,
        categoryBreakdown,
      },
    });
  } catch (err) {
    console.error('getSummary error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving summary' });
  }
};
