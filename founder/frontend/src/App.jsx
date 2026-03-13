import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import { Swipe } from './pages/Swipe';
import { Feed } from './pages/Feed';
import { CreateProject } from './pages/CreateProject';
import { Messages } from './pages/Messages';
import { BecomeFounder } from './pages/BecomeFounder';
import { Landing } from './pages/Landing';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-pulse text-gray-500">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-pulse text-gray-500">Loading...</div></div>;
  if (user) return <Navigate to="/swipe" replace />;
  return children;
}

function LandingOrSwipe() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-pulse text-gray-500">Loading...</div></div>;
  return user ? <Navigate to="/swipe" replace /> : <Landing />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#faf9fc] text-[#1a1a2e]">
      <Navbar />
      <main className="pt-20 pb-20">
        <Routes>
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/swipe" element={<ProtectedRoute><Swipe /></ProtectedRoute>} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/become-founder" element={<BecomeFounder />} />
          <Route path="/" element={<LandingOrSwipe />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
