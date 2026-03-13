import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const loc = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/98 backdrop-blur-md border-b border-purple-100 flex items-center justify-between px-4 shadow-sm shadow-founder-purple/10">
      <Link to="/" className="text-xl font-extrabold text-founder-purple tracking-tight font-logo hover:text-founder-purpleLight transition-all hover:scale-105">
        founder.
      </Link>
      <div className="flex items-center gap-3">
        <Link
          to="/become-founder"
          className="px-4 py-2 rounded-full bg-gradient-to-r from-founder-purple to-founder-purpleLight text-white text-sm font-semibold hover:shadow-lg hover:shadow-founder-purple/30 transition-all"
        >
          Become a founder.
        </Link>
        <Link
          to="/feed"
          className={`text-sm ${loc.pathname === '/feed' ? 'text-founder-purple font-medium' : 'text-gray-500 hover:text-founder-purple'}`}
        >
          Feed
        </Link>
        {user ? (
          <>
            <Link
              to="/swipe"
              className={`text-sm ${loc.pathname === '/swipe' ? 'text-founder-purple font-medium' : 'text-gray-500 hover:text-founder-purple'}`}
            >
              Swipe
            </Link>
            <Link
              to="/create-project"
              className={`text-sm ${loc.pathname === '/create-project' ? 'text-founder-purple font-medium' : 'text-gray-500 hover:text-founder-purple'}`}
            >
              Post
            </Link>
            <Link
              to="/profile"
              className={`text-sm ${loc.pathname === '/profile' ? 'text-founder-purple font-medium' : 'text-gray-500 hover:text-founder-purple'}`}
            >
              Profile
            </Link>
            <Link
              to="/messages"
              className={`text-sm ${loc.pathname === '/messages' ? 'text-founder-purple font-medium' : 'text-gray-500 hover:text-founder-purple'}`}
            >
              Messages
            </Link>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-founder-purple"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link to="/auth" className="text-sm text-black font-medium hover:underline">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
