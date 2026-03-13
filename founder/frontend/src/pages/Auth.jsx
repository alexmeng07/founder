import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const { user, loading, signIn, signUp, confirmSignUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black animate-pulse">Loading…</div>
      </div>
    );
  }
  if (user) return <Navigate to="/profile" replace />;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signUp(email, password, name);
      // Mock auth signs in immediately — no confirm step
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await confirmSignUp(pendingEmail || email, code);
      setMode('signin');
      setPendingEmail(null);
      setCode('');
    } catch (err) {
      setError(err.message || 'Confirmation failed');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'confirm') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-black mb-6">Confirm your email</h1>
          <form onSubmit={handleConfirm} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code from email"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-founder-accent"
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-founder-purple text-white hover:bg-founder-purpleLight font-medium transition disabled:opacity-50"
            >
              {busy ? 'Confirming…' : 'Confirm'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <h1 className="text-3xl font-bold text-black mb-2">Founder</h1>
        <p className="text-gray-500 mb-8">Find your hackathon teammates & co-founders</p>

        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-founder-accent"
            required
          />
          {mode === 'signup' && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-founder-accent"
            />
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-founder-accent"
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-founder-purple text-white hover:bg-founder-purpleLight font-medium transition disabled:opacity-50"
          >
            {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
          className="mt-6 w-full text-gray-500 hover:text-founder-purple text-sm transition"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
