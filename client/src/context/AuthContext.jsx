import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../services/api.js';

// ── State shape ────────────────────────────────────────────────────────────
//
//   status : 'loading' | 'authenticated' | 'unauthenticated' | 'restore_error'
//   user   : { _id, name, email, monthlyBudget, ... } | null
//   token  : string | null
//   restoreError : string | null
//
// 'loading' is the initial state while we attempt to restore a session from
// sessionStorage.  Components that depend on auth should wait for 'loading'
// to resolve before rendering protected content or redirecting.

const initialState = {
  status: 'loading',
  user: null,
  token: null,
  restoreError: null,
};

// ── Reducer ────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'RESTORE_SESSION':
      return {
        status: 'authenticated',
        user: action.user,
        token: action.token,
        restoreError: null,
      };

    case 'LOGIN':
      return {
        status: 'authenticated',
        user: action.user,
        token: action.token,
        restoreError: null,
      };

    case 'RESTORE_PENDING':
      return { ...state, status: 'loading', restoreError: null };

    case 'RESTORE_ERROR':
      return {
        ...state,
        status: 'restore_error',
        restoreError: action.message,
      };

    case 'LOGOUT':
      return { status: 'unauthenticated', user: null, token: null, restoreError: null };

    case 'NO_SESSION':
      return { status: 'unauthenticated', user: null, token: null, restoreError: null };

    case 'UPDATE_USER':
      // Used after budget update etc. to keep displayed user data fresh.
      return { ...state, user: { ...state.user, ...action.updates } };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the application and provides authentication state.
 *
 * On mount it attempts to restore a previous session:
 *  1. Reads the JWT from sessionStorage (blueprint §11 — MVP trade-off).
 *  2. Calls GET /api/auth/me to verify the token is still valid.
 *  3. Clears the session only for a confirmed 401; temporary failures remain
 *     retryable without discarding the stored token.
 *
 * Token storage choice: sessionStorage, per blueprint §11.
 *  "For the MVP, sessionStorage may be used for the JWT.  This is a
 *   prototype trade-off, not a claim that browser storage is fully secure."
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const restoreSession = useCallback(async (signal) => {
    const stored = sessionStorage.getItem('pennywise_token');
    if (!stored) {
      dispatch({ type: 'NO_SESSION' });
      return;
    }

    try {
      const { data } = await api.get('/auth/me', { signal });
      dispatch({ type: 'RESTORE_SESSION', user: data.user, token: stored });
    } catch (err) {
      if (signal?.aborted) return;

      if (err.status === 401) {
        sessionStorage.removeItem('pennywise_token');
        dispatch({ type: 'NO_SESSION' });
        return;
      }

      dispatch({
        type: 'RESTORE_ERROR',
        message: 'Unable to verify your session right now. Check your connection and try again.',
      });
    }
  }, []);

  // ── Session restore on mount ─────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    restoreSession(controller.signal);
    return () => controller.abort();
  }, [restoreSession]);

  const retrySessionRestore = useCallback(() => {
    dispatch({ type: 'RESTORE_PENDING' });
    return restoreSession();
  }, [restoreSession]);

  // ── login ────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    sessionStorage.setItem('pennywise_token', data.token);
    dispatch({ type: 'LOGIN', user: data.user, token: data.token });
    return data;
  }, []);

  // ── register ─────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    sessionStorage.setItem('pennywise_token', data.token);
    dispatch({ type: 'LOGIN', user: data.user, token: data.token });
    return data;
  }, []);

  // ── logout ───────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    sessionStorage.removeItem('pennywise_token');
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ── updateUser ───────────────────────────────────────────────────────
  // Called by budget/profile update handlers in M4 to keep context fresh.
  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', updates });
  }, []);

  const value = {
    status: state.status,
    user: state.user,
    token: state.token,
    isAuthenticated: state.status === 'authenticated',
    isLoading: state.status === 'loading',
    login,
    register,
    logout,
    updateUser,
    restoreError: state.restoreError,
    retrySessionRestore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — convenience hook.  Throws if used outside AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
