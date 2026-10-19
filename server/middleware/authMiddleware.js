import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect — Express middleware that verifies a Bearer JWT on every
 * protected route.
 *
 * On success:  sets req.user to the authenticated User document
 *              (password excluded by the model's toJSON transform)
 *              and calls next().
 * On failure:  returns 401 with a safe error message.
 *              Stack traces and internal details are never sent to the client.
 *
 * Blueprint §9 rules:
 *  - Token is read from the Authorization header only (never from the body
 *    or query string) so the client cannot inject an arbitrary user ID.
 *  - jwt.verify() checks both signature and expiry automatically.
 *  - The user ID is taken from the verified token payload, never from the
 *    request body or query string.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised — no token provided' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorised — token has expired' });
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Not authorised — invalid token' });
    }
    console.error('Token verification error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }

  let user;
  try {
    // Fetch the user from the database to ensure the account still exists.
    // Exclude the password hash from protected-route user data.
    user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(401).json({ message: 'Not authorised — invalid token' });
    }
    console.error('Authentication user lookup error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (!user) {
    return res.status(401).json({ message: 'Not authorised — user not found' });
  }

  req.user = user;
  return next();
};

export default protect;
