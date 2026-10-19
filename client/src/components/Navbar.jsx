import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Navbar — top navigation bar.
 *
 * Shows:
 *  - Brand logo + name (always).
 *  - User greeting and logout button when authenticated.
 *
 * Blueprint §10 — Navbar responsibilities:
 *   brand and navigation, user greeting, logout action.
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar" role="banner">
      <Link to={isAuthenticated ? '/dashboard' : '/login'} className="navbar-brand">
        <Wallet size={22} aria-hidden="true" />
        <span>PennyWise</span>
      </Link>

      {isAuthenticated && user && (
        <div className="navbar-right">
          <span className="navbar-greeting">
            Hello, <strong>{user.name}</strong>
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </header>
  );
}
