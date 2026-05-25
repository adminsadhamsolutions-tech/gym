import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const [email, setEmail] = useState('admin@gymerp.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const AUTO_LOGIN = (import.meta.env.VITE_AUTO_LOGIN || import.meta.env.VITE_DEV_AUTO_LOGIN) === 'true';

  // Auto-submit on mount if dev auto-login is enabled
  useEffect(() => {
    if (AUTO_LOGIN && !user && !loading) {
      setLoading(true);
      login(email, password).then(() => {
        setTimeout(() => navigate(from, { replace: true }), 100);
      }).catch(err => {
        setError(err.message || 'Auto-login failed');
        setLoading(false);
      });
    }
  }, [AUTO_LOGIN, user, loading, login, navigate, from, email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);

      // small delay ensures state sync
      setTimeout(() => {
        navigate('/');
      }, 100);

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        'Login failed. Check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 p-4">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-800 bg-slate-950 p-10 shadow-soft">
        
        <h1 className="text-4xl font-semibold text-white">Admin Login</h1>
        <p className="mt-3 text-slate-400">
          {AUTO_LOGIN ? 'Accessing dashboard...' : 'Secure access to your gym management ERP.'}
        </p>

        {AUTO_LOGIN && loading && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
            <p className="mt-4 text-slate-300">Auto-logging in...</p>
          </div>
        )}

        {!AUTO_LOGIN && (
          <>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">

          <div>
            <label className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white shadow-inner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white shadow-inner"
            />
          </div>

          {error && (
            <div className="rounded-3xl border border-red-600 bg-red-950 px-4 py-3 text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-orange-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-orange-400"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

        </form>
        </>
        )}
      </div>
    </div>
  );
};

export default Login;