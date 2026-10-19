import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Login page.
 *
 * Blueprint §10:
 *  - Email and password fields.
 *  - Form validation.
 *  - Loading state.
 *  - Error feedback.
 *  - Link to registration.
 *
 * Already-authenticated users are redirected straight to /dashboard.
 */
export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Redirect authenticated users away from this page ──────────────────
  // Wait until session restore finishes before deciding.
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  // ── Client-side validation ─────────────────────────────────────────────
  const validate = () => {
    if (!email.trim())    return 'Email is required';
    if (!password)        return 'Password is required';
    // Simple email format check — real validation is on the server.
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your PennyWise account</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              disabled={submitting}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Footer link */}
        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </main>
  );
}
