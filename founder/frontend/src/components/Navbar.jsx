import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const loc = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-founder-bg/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4">
      <Link to="/" className="text-lg font-bold text-white tracking-tight">
        Founder
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/feed"
          className={`text-sm ${loc.pathname === '/feed' ? 'text-founder-accent' : 'text-zinc-400 hover:text-white'}`}
        >
          Feed
        </Link>
        {user ? (
          <>
            <Link
              to="/swipe"
              className={`text-sm ${loc.pathname === '/swipe' ? 'text-founder-accent' : 'text-zinc-400 hover:text-white'}`}
            >
              Swipe
            </Link>
            <Link
              to="/create-project"
              className={`text-sm ${loc.pathname === '/create-project' ? 'text-founder-accent' : 'text-zinc-400 hover:text-white'}`}
            >
              Post
            </Link>
            <Link
              to="/profile"
              className={`text-sm ${loc.pathname === '/profile' ? 'text-founder-accent' : 'text-zinc-400 hover:text-white'}`}
            >
              Profile
            </Link>
            <button
              onClick={signOut}
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link to="/auth" className="text-sm text-founder-accent hover:text-founder-accentHover">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
