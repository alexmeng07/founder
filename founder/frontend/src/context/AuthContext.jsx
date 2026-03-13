import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MOCK_USER_KEY = 'mock_user';
const MOCK_USER_ID_KEY = 'mock_user_id';

function getStoredUser() {
  try {
    const raw = localStorage.getItem(MOCK_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function storeUser(user) {
  if (user) {
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    localStorage.setItem(MOCK_USER_ID_KEY, user.userId);
  } else {
    localStorage.removeItem(MOCK_USER_KEY);
    localStorage.removeItem(MOCK_USER_ID_KEY);
  }
}

function makeMockUser(email, name) {
  const userId = `mock-${crypto.randomUUID().slice(0, 8)}`;
  return {
    userId,
    username: email,
    email: email || '',
    name: name || email?.split('@')[0] || 'Demo User',
    attributes: { email: email || '', name: name || 'Demo User' },
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      storeUser(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const signIn = useCallback(async (email, password) => {
    const u = makeMockUser(email, null);
    setUser(u);
    storeUser(u);
    return u;
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    const u = makeMockUser(email, name);
    setUser(u);
    storeUser(u);
    return u;
  }, []);

  const confirmSignUp = useCallback(async () => {
    // No-op for mock auth
  }, []);

  const signOut = useCallback(async () => {
    storeUser(null);
    setUser(null);
  }, []);

  const getToken = useCallback(async () => {
    const u = getStoredUser();
    return u?.userId || null;
  }, []);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    getToken,
    userId: user?.userId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
