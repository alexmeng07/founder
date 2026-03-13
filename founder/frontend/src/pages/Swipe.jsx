import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { SwipeCard } from '../components/SwipeCard';
import { MatchModal } from '../components/MatchModal';
import { DEMO_USERS } from '../data/demoData';

export function Swipe() {
  const { userId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [triggerSwipe, setTriggerSwipe] = useState(null);

  const fetchFeed = async () => {
    try {
      if (!userId) {
        setUsers(DEMO_USERS);
        setLoading(false);
        return;
      }
      const { data } = await api.get('/swipe/feed');
      if (data?.success && data?.data?.users?.length > 0) {
        setUsers(data.data.users);
      } else {
        // Fallback: use demo data when API returns empty
        const filtered = DEMO_USERS.filter((u) => u.userId !== userId);
        setUsers(filtered);
      }
    } catch (e) {
      console.error(e);
      // Fallback: use demo data when API fails
      const filtered = DEMO_USERS.filter((u) => u.userId !== userId);
      setUsers(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [userId]);

  const handleSwipe = async (direction, user) => {
    try {
      if (!user.userId.startsWith('demo-')) {
        const { data } = await api.post('/swipe', { swipeeId: user.userId, direction });
        if (data?.success && data?.data?.matched) {
          setMatch({ user, direction });
        }
      } else if (direction === 'right') {
        // Demo mode: show match modal for any right swipe
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
    <div className="min-h-screen flex flex-col items-center pt-8 pb-12 px-4 bg-gradient-to-b from-amber-50/80 via-purple-50/60 to-pink-50/80">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-founder-purple via-purple-600 to-pink-600 mb-8 animate-fade-in font-logo">
        find your collaborator.
      </h1>
      <div className="flex items-center gap-5">
        <button
          onClick={() => topUser && !triggerSwipe && setTriggerSwipe({ animateDir: 'right', choice: 'left' })}
          disabled={!topUser || !!triggerSwipe}
          className="w-16 h-16 rounded-full border-4 border-rose-300 flex items-center justify-center text-rose-400 hover:border-rose-500 hover:text-rose-600 hover:scale-110 hover:bg-rose-50 transition-all flex-shrink-0 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Pass"
        >
          <span className="text-3xl">✕</span>
        </button>
        <div className="relative h-[560px] w-[380px] flex-shrink-0 overflow-visible">
          {topUser ? (
            <SwipeCard
              key={topUser.userId}
              user={topUser}
              onSwipe={(choice) => {
                handleSwipe(choice, topUser);
                setTriggerSwipe(null);
              }}
              triggerSwipe={triggerSwipe}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/90 border-2 border-purple-200 text-gray-500 shadow-xl">
              <p className="text-[var(--text-muted)]">No more people for now. Check back later.</p>
            </div>
          )}
        </div>
        <button
          onClick={() => topUser && !triggerSwipe && setTriggerSwipe({ animateDir: 'left', choice: 'right' })}
          disabled={!topUser || !!triggerSwipe}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-founder-purple to-pink-500 flex items-center justify-center text-white hover:scale-110 shadow-xl shadow-founder-purple/40 transition-all flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Interest"
        >
          <span className="text-3xl">♥</span>
        </button>
      </div>
      {match && match.direction === 'right' && (
        <MatchModal user={match.user} onClose={onMatchClose} />
      )}
    </div>
  );
}
