import axios from 'axios';

/**
 * Axios instance pre-configured with the API base URL.
 *
 * Request interceptor — attaches the JWT from sessionStorage as a Bearer
 * token on every outgoing request.  Reading from storage at call time (not
 * once at module load) means logout takes effect immediately without
 * reloading the module.
 *
 * Response interceptor — translates Axios error objects into plain JS Error
 * instances with a `.message` that is safe to display to users.  Does NOT
 * dispatch auth actions here (that would create a circular dependency with
 * AuthContext); instead it preserves the 401 status so callers and the
 * AuthContext session-restore logic can handle it.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('pennywise_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ───────────────────────────────────────────────────
// Extracts the server's `message` string so components can do:
//   catch (err) { setError(err.message); }
// without worrying about the Axios error shape.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    const enhancedError = new Error(serverMessage);
    enhancedError.status = error.response?.status;
    enhancedError.data   = error.response?.data;
    return Promise.reject(enhancedError);
  },
);

export default api;
