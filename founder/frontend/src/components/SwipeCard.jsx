import { useState, useEffect } from 'react';
import SkillTag from './SkillTag';
import { getAvatarViewUrl } from '../utils/api';

const UOFT_LOGO_URL = '/uoft-logo.svg';

export function SwipeCard({ user, onSwipe, triggerSwipe }) {
  const [x, setX] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (user?.avatarS3Key) {
      getAvatarViewUrl(user.avatarS3Key).then(setAvatarUrl);
    }
  }, [user?.avatarS3Key]);

  useEffect(() => {
    if (!triggerSwipe) return;
    const { animateDir, choice } = triggerSwipe;
    const exitX = animateDir === 'left' ? -400 : 400;
    const exitRotate = animateDir === 'left' ? -30 : 30;
    setX(exitX);
    setRotate(exitRotate);
    const timer = setTimeout(() => onSwipe(choice), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerSwipe]);

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="absolute left-1/2 top-0 w-[360px] -ml-[180px] rounded-2xl overflow-hidden touch-none select-none"
      style={{
        boxShadow: '0 12px 40px rgba(107, 33, 168, 0.2)',
        transform: `translateX(${x}px) rotate(${rotate}deg)`,
        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div className="aspect-[3/4] flex flex-col bg-gradient-to-b from-purple-100 via-white to-amber-50/80 border-2 border-purple-200">
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-50 p-8 relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-founder-purple shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-founder-purple/30 to-pink-200/50 flex items-center justify-center text-founder-purple text-2xl font-bold border-4 border-founder-purple/40 shadow-lg">
              {initials}
            </div>
          )}
          {user?.userId?.startsWith('demo-') && (
            <div className="absolute bottom-2 right-2 w-7 h-7 rounded-md bg-white border border-purple-200 flex items-center justify-center shadow-sm">
              <img src={UOFT_LOGO_URL} alt="UofT" className="w-5 h-5 object-contain" />
            </div>
          )}
        </div>
        <div className="p-6 border-t-2 border-purple-200 bg-white/90">
          <h3 className="font-bold text-xl text-founder-purple">{user?.name || 'Anonymous'}</h3>
          {(user?.university || user?.graduationYear) && (
            <p className="text-sm text-purple-600 mt-1 font-medium">
              {[user.university, user.graduationYear].filter(Boolean).join(' · ')}
            </p>
          )}
          {user?.bio && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{user.bio}</p>
          )}
          {user?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {user.skills.slice(0, 6).map((s) => (
                <SkillTag key={s} label={s} active />
              ))}
            </div>
          )}
          {user?.githubRepos?.length > 0 && (
            <div className="mt-3 text-xs text-[var(--text-muted)]">
              <span className="font-medium text-black">GitHub:</span>{' '}
              {user.githubRepos.slice(0, 3).map((r) => r.name).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
