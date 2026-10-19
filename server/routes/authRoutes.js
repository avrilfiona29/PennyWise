import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/register — public
router.post('/register', register);

// POST /api/auth/login — public
router.post('/login', login);

// GET /api/auth/me — protected
router.get('/me', protect, getMe);

export default router;
