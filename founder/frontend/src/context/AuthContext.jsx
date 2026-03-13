import { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  fetchAuthSession,
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  signOut as amplifySignOut,
} from 'aws-amplify/auth';

const AuthContext = createContext(null);

async function storeToken() {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) localStorage.setItem('token', token);
    return token;
  } catch {
    localStorage.removeItem('token');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(async (u) => {
        setUser(u);
        await storeToken();
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const signIn = async (email, password) => {
    await amplifySignIn({ username: email, password });
    const u = await getCurrentUser();
    await storeToken();
    setUser(u);
    return u;
  };

  const signUp = async (email, password, name) => {
    await amplifySignUp({
      username: email,
      password,
      options: { userAttributes: { email, name: name || email.split('@')[0] } },
    });
  };

  const confirmSignUp = async (email, code) => {
    await amplifyConfirmSignUp({ username: email, confirmationCode: code });
  };

  const signOut = async () => {
    await amplifySignOut();
    localStorage.removeItem('token');
    setUser(null);
  };

  const getToken = async () => {
    const token = await storeToken();
    return token || localStorage.getItem('token');
  };

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
