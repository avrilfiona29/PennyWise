import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Issue a signed JWT containing only the user's MongoDB _id.
 * The token expires in 7 days.
 * JWT_SECRET is read from the environment — never hardcoded.
 *
 * @param {string} id - MongoDB ObjectId string
 * @returns {string} signed JWT
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── POST /api/auth/register ────────────────────────────────────────────────

/**
 * Register a new user account.
 *
 * Validations:
 *  - name, email, and password are all required (blueprint §8).
 *  - Duplicate emails return 409 (blueprint §8 API contract).
 *  - Password is hashed with bcrypt before storage (blueprint §9 rule 1).
 *  - The hashed password is never returned (model toJSON strips it).
 *
 * Success: HTTP 201 + JWT + public user object.
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Input validation ─────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // ── Duplicate email check ─────────────────────────────────────────────
    // Email is normalised to lowercase by the schema before the query.
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }

    // ── Hash password ─────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ── Create user ───────────────────────────────────────────────────────
    const user = await User.create({
      name,
      email,       // schema lowercases + trims automatically
      password: hashedPassword,
    });

    // user.toJSON() strips the password field via the schema transform.
    return res.status(201).json({
      token: signToken(user._id),
      user,
    });
  } catch (err) {
    // Mongoose duplicate-key error code
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }
    console.error('register error:', err.message);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────

/**
 * Authenticate a user with email and password.
 *
 * Validations:
 *  - email and password are required.
 *  - Returns 401 (not 404) for any credential mismatch so the response
 *    does not reveal whether the email exists (blueprint §9).
 *  - bcrypt.compare() is constant-time to resist timing attacks.
 *
 * Success: HTTP 200 + JWT + public user object.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user — need the password field here (excluded by default in
    // findById+select, but findOne returns all fields unless told otherwise).
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Serialise without password (toJSON transform).
    const userJSON = user.toJSON();

    return res.status(200).json({
      token: signToken(user._id),
      user: userJSON,
    });
  } catch (err) {
    console.error('login error:', err.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────────────────

/**
 * Return the profile of the currently authenticated user.
 *
 * The protect middleware already verified the token and attached req.user.
 * The password is excluded by the middleware's .select('-password') query.
 *
 * Success: HTTP 200 + public user object.
 */
export const getMe = async (req, res) => {
  // req.user is guaranteed to exist and have no password field.
  return res.status(200).json({ user: req.user });
};
