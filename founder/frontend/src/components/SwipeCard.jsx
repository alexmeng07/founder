import { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import SkillTag from './SkillTag';
import { getAvatarViewUrl } from '../utils/api';

export function SwipeCard({ user, onSwipe, disabled }) {
  const [{ x, rotate }, api] = useSpring(() => ({ x: 0, rotate: 0 }));
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (user?.avatarS3Key) {
      getAvatarViewUrl(user.avatarS3Key).then(setAvatarUrl);
    }
  }, [user?.avatarS3Key]);

  const handleDrag = (down, mx) => {
    if (disabled) return;
    const r = Math.min(Math.max(mx / 20, -15), 15);
    api.start({ x: down ? mx : 0, rotate: down ? r : 0 });
  };

  const handleRelease = (mx, vel) => {
    if (disabled) return;
    const threshold = 120;
    if (Math.abs(mx) > threshold || Math.abs(vel) > 0.5) {
      const dir = mx > 0 ? 'right' : 'left';
      api.start({
        x: dir === 'right' ? 400 : -400,
        rotate: dir === 'right' ? 20 : -20,
        onRest: () => onSwipe(dir),
      });
    } else {
      api.start({ x: 0, rotate: 0 });
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
      className="absolute w-[360px] rounded-3xl bg-founder-card border border-[var(--border)] overflow-hidden touch-none select-none"
      style={{
        x,
        rotate,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
      onPointerDown={(e) => {
        const startX = e.clientX;
        const startVal = x.get();
        const onMove = (ev) => handleDrag(true, startVal + ev.clientX - startX);
        const onUp = (ev) => {
          handleRelease(startVal + ev.clientX - startX, 0);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      }}
    >
      <div className="aspect-[3/4] flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-founder-card p-6">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-founder-accent"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-founder-accent/20 flex items-center justify-center text-founder-accent text-xl font-bold">
              {initials}
            </div>
          )}
        </div>
        <div className="p-5 border-t border-[var(--border)]">
          <h3 className="font-bold text-lg text-white">{user?.name || 'Anonymous'}</h3>
          {(user?.university || user?.graduationYear) && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {[user.university, user.graduationYear].filter(Boolean).join(' · ')}
            </p>
          )}
          {user?.bio && (
            <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2">{user.bio}</p>
          )}
          {user?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {user.skills.slice(0, 6).map((s) => (
                <SkillTag key={s} label={s} active />
              ))}
            </div>
          )}
          {user?.githubRepos?.length > 0 && (
            <div className="mt-3 text-xs text-[var(--text-muted)]">
              <span className="font-medium text-white">GitHub:</span>{' '}
              {user.githubRepos.slice(0, 3).map((r) => r.name).join(', ')}
            </div>
          )}
        </div>
      </div>
    </animated.div>
  );
}
