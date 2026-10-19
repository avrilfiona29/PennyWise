import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * ProtectedRoute — wraps a page that requires authentication.
 *
 * Behaviour:
 *  - While session restoration is in progress (status === 'loading'),
 *    renders a full-screen spinner so there is no flash of redirect.
 *  - Once loading finishes, redirects unauthenticated users to /login.
 *  - Passes through authenticated users to render their children.
 *
 * Usage:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    isLoading,
    status,
    restoreError,
    retrySessionRestore,
  } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading-screen" aria-label="Checking authentication">
        <span className="auth-spinner" aria-hidden="true" />
        <p>Loading…</p>
      </div>
    );
  }

  if (status === 'restore_error') {
    return (
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="session-restore-title">
          <div className="auth-header">
            <h1 className="auth-title" id="session-restore-title">Session unavailable</h1>
            <p className="auth-subtitle" role="alert">{restoreError}</p>
          </div>
          <div className="auth-form">
            <button
              type="button"
              className="btn btn-primary btn-full"
              onClick={retrySessionRestore}
            >
              Retry session check
            </button>
            <Link className="btn btn-ghost btn-full" to="/login">
              Go to sign in
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
