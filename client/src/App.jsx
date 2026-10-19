import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';

/**
 * App — root router with authentication.
 *
 * AuthProvider wraps BrowserRouter so that auth context is available
 * everywhere, including inside route components that call useNavigate().
 *
 * Route protection:
 *  - /dashboard  is wrapped in ProtectedRoute — unauthenticated users are
 *                sent to /login; the loading spinner prevents flash.
 *  - /login and /register redirect to /dashboard when already authenticated
 *                (handled inside those page components).
 *  - Catch-all redirects to /login.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
