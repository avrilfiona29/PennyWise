/**
 * Shared validation helpers for M2.
 * Blueprint §6.3 — allowed categories per transaction type.
 */

export const EXPENSE_CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Education',
  'Bills', 'Entertainment', 'Health', 'Other',
];

export const INCOME_CATEGORIES = ['Salary', 'Allowance', 'Other'];

export const TRANSACTION_TYPES = ['income', 'expense'];

/**
 * Return an error message string if the category is not valid for the given
 * type, or null if it is valid.
 *
 * @param {string} type     - 'income' | 'expense'
 * @param {string} category - category string from request
 * @returns {string|null}
 */
export const validateCategory = (type, category) => {
  if (type === 'expense' && !EXPENSE_CATEGORIES.includes(category)) {
    return `Invalid category for expense. Allowed: ${EXPENSE_CATEGORIES.join(', ')}`;
  }
  if (type === 'income' && !INCOME_CATEGORIES.includes(category)) {
    return `Invalid category for income. Allowed: ${INCOME_CATEGORIES.join(', ')}`;
  }
  return null;
};

/**
 * Validate a transaction amount:
 *  - Must be a number (or a numeric string).
 *  - Must be finite, positive, and non-zero.
 *
 * Returns an error message string or null.
 *
 * @param {*} raw - value from req.body
 * @returns {string|null}
 */
export const validateAmount = (raw) => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    return 'Amount must be a positive number greater than zero';
  }
  return null;
};

/**
 * Return the UTC start and end of the current calendar month.
 * Using UTC boundaries avoids off-by-one-day errors when comparing against
 * dates stored as UTC timestamps in MongoDB.
 *
 * @returns {{ start: Date, end: Date }}
 */
export const currentMonthBounds = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
};
