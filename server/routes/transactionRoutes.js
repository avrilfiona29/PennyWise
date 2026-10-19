import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} from '../controllers/transactionController.js';
import { updateBudget } from '../controllers/budgetController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

// All transaction routes require authentication.
router.use(protect);

// ── Specific routes first (must precede /:id) ──────────────────────────────
// If these were declared after /:id, Express would match the literal strings
// "summary" and "budget" as MongoDB ObjectId params and return 404 or cast
// errors instead of reaching these handlers.

// GET  /api/transactions/summary  — dashboard aggregation (blueprint §8)
router.get('/summary', getSummary);

// PUT  /api/transactions/budget   — update monthly budget (blueprint §8)
router.put('/budget', updateBudget);

// ── Collection routes ──────────────────────────────────────────────────────

// GET  /api/transactions          — list user's transactions (with optional filters)
router.get('/', getTransactions);

// POST /api/transactions          — create a transaction
router.post('/', createTransaction);

// ── Document routes ────────────────────────────────────────────────────────

// PUT    /api/transactions/:id    — update a transaction owned by this user
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id    — delete a transaction owned by this user
router.delete('/:id', deleteTransaction);

export default router;
