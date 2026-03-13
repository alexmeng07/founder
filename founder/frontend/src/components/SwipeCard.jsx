import { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import SkillTag from './SkillTag';
import { getAvatarViewUrl } from '../utils/api';

const UOFT_LOGO_URL = '/uoft-logo.svg';

export function SwipeCard({ user, onSwipe, disabled }) {
  const [spring, api] = useSpring(() => ({
    x: 0,
    rotate: 0,
    config: { tension: 300, friction: 30 },
  }));
  const [avatarUrl, setAvatarUrl] = useState(null);
  const dragStart = useRef({ x: 0, clientX: 0 });

  useEffect(() => {
    if (user?.avatarS3Key) {
      getAvatarViewUrl(user.avatarS3Key).then(setAvatarUrl);
    }
  }, [user?.avatarS3Key]);

  const handlePointerDown = (e) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: spring.x.get(), clientX: e.clientX };
  };

  const handlePointerMove = (e) => {
    if (disabled) return;
    const dx = e.clientX - dragStart.current.clientX;
    const newX = dragStart.current.x + dx;
    const rotate = Math.min(Math.max(newX / 12, -25), 25);
    api.start({ x: newX, rotate, immediate: true });
  };

  const handlePointerUp = (e) => {
    if (disabled) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const dx = e.clientX - dragStart.current.clientX;
    const currentX = dragStart.current.x + dx;
    const threshold = 80;
    if (Math.abs(currentX) > threshold) {
      const dir = currentX > 0 ? 'right' : 'left';
      const exitX = dir === 'right' ? 400 : -400;
      const exitRotate = dir === 'right' ? 30 : -30;
      api.start({
        x: exitX,
        rotate: exitRotate,
        config: { tension: 180, friction: 22 },
        onRest: () => onSwipe(dir),
      });
    } else {
      api.start({ x: 0, rotate: 0, config: { tension: 280, friction: 28 } });
    }
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <animated.div
      className="absolute left-1/2 top-0 w-[360px] -ml-[180px] rounded-2xl overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
      style={{
        boxShadow: '0 12px 40px rgba(107, 33, 168, 0.2)',
        x: spring.x,
        rotate: spring.rotate,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
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
    </animated.div>
  );
}
