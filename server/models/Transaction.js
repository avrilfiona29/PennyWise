import mongoose from 'mongoose';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/validators.js';

/**
 * Transaction collection schema.
 * Blueprint §6.2.
 *
 * Security rules:
 *  - The `user` field is always set from req.user._id (verified JWT),
 *    never from the client request body.
 *  - Category is validated against the allowed list for the transaction type.
 *  - Amount must be positive and finite.
 */
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense',
      },
      required: [true, 'Transaction type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title must not exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      validate: {
        validator: (v) => Number.isFinite(v) && v > 0,
        message: 'Amount must be a positive number greater than zero',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      // Cross-field validation (category vs type) is enforced in the
      // controller via validateCategory() before the document is saved.
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must not exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
);

/**
 * Compound index on (user, date) for efficient per-user date-range queries
 * (dashboard aggregation, monthly summaries).  Blueprint §6.2.
 */
transactionSchema.index({ user: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
