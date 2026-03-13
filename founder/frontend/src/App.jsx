import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import { Swipe } from './pages/Swipe';
import { Feed } from './pages/Feed';
import { CreateProject } from './pages/CreateProject';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-founder-bg"><div className="animate-pulse text-founder-accent">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-founder-bg"><div className="animate-pulse text-founder-accent">Loading...</div></div>;
  if (user) return <Navigate to="/swipe" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-founder-bg text-white">
      <Navbar />
      <main className="pb-20">
        <Routes>
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/swipe" element={<ProtectedRoute><Swipe /></ProtectedRoute>} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/swipe" replace />} />
          <Route path="*" element={<Navigate to="/swipe" replace />} />
        </Routes>
      </main>
    </div>
  );
}
