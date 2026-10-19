import mongoose from 'mongoose';

/**
 * User collection schema.
 * Blueprint §6.1.
 *
 * Security rules:
 *  - Password is stored as a bcrypt hash only (enforced in authController).
 *  - The toJSON transform strips the password field from every serialised
 *    response so it can never accidentally reach the client.
 *  - Email is normalised to lowercase before the uniqueness check.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,   // normalise before storage and uniqueness checks
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    monthlyBudget: {
      type: Number,
      default: 5000,
      min: [0, 'Monthly budget cannot be negative'],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
);

/**
 * Strip the password hash from every JSON serialisation.
 * This ensures password never appears in API responses regardless of
 * where the document is serialised — controllers do not need to remember.
 */
userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
