import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { SwipeCard } from '../components/SwipeCard';
import { MatchModal } from '../components/MatchModal';

export function Swipe() {
  const { userId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);

  const fetchFeed = async () => {
    if (!userId) return;
    try {
      const { data } = await api.get('/swipe/feed');
      if (data?.success && data?.data?.users) {
        setUsers(data.data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [userId]);

  const handleSwipe = async (direction, user) => {
    try {
      const { data } = await api.post('/swipe', { swipeeId: user.userId, direction });
      if (data?.success && data?.data?.matched) {
        setMatch({ user, direction });
      }
    } catch (e) {
      console.error(e);
    }
    setUsers((prev) => prev.slice(1));
  };

  const onMatchClose = () => setMatch(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  const topUser = users[0];

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-12 px-4">
      <h1 className="text-2xl font-bold mb-8">Find your co-founder</h1>
      <div className="relative h-[520px] w-[360px]">
        {topUser ? (
          <SwipeCard
            user={topUser}
            onSwipe={(dir) => handleSwipe(dir, topUser)}
            disabled={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-founder-card border border-[var(--border)]">
            <p className="text-[var(--text-muted)]">No more people for now. Check back later.</p>
          </div>
        )}
      </div>
      <div className="flex gap-6 mt-8">
        <button
          onClick={() => topUser && handleSwipe('left', topUser)}
          className="w-16 h-16 rounded-full border-2 border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-red-500/50 transition-colors"
          aria-label="Pass"
        >
          <span className="text-2xl">✕</span>
        </button>
        <button
          onClick={() => topUser && handleSwipe('right', topUser)}
          className="w-16 h-16 rounded-full bg-founder-accent flex items-center justify-center text-white hover:bg-founder-accentHover transition-colors"
          aria-label="Interest"
        >
          <span className="text-2xl">♥</span>
        </button>
      </div>
      {match && match.direction === 'right' && (
        <MatchModal user={match.user} onClose={onMatchClose} />
      )}
    </div>
  );
}
