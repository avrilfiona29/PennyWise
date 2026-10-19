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

  try {
    // Throws if the signature is invalid or the token has expired.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database to ensure the account still exists.
    // .select('-password') is a belt-and-suspenders guard; toJSON already
    // strips the password, but this avoids loading the hash at all.
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorised — user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    // jwt.verify throws JsonWebTokenError (bad signature) and
    // TokenExpiredError (expired). Both are 401 situations.
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorised — token has expired' });
    }
    return res.status(401).json({ message: 'Not authorised — invalid token' });
  }
};

export default protect;
