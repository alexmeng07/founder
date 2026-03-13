import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const loc = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/98 backdrop-blur-md border-b border-purple-100 flex items-center justify-between px-4 shadow-sm shadow-founder-purple/10">
      <Link to="/" state={{ fromLogo: true }} className="text-xl font-extrabold text-founder-purple tracking-tight font-logo hover:text-founder-purpleLight transition-all hover:scale-105">
        founder.
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to="/become-founder"
          className="px-4 py-2 rounded-full bg-gradient-to-r from-founder-purple to-founder-purpleLight text-white text-sm font-semibold hover:shadow-lg hover:shadow-founder-purple/30 transition-all"
        >
          Become a founder.
        </Link>
        <Link
          to="/feed"
          className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${loc.pathname === '/feed' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Feed
        </Link>
        {user ? (
          <>
            <Link
              to="/swipe"
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${loc.pathname === '/swipe' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Swipe
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${loc.pathname === '/profile' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Profile
            </Link>
            <Link
              to="/messages"
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${loc.pathname === '/messages' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Messages
            </Link>
            <button
              onClick={signOut}
              className="px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
