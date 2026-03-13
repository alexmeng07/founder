import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getAvatarViewUrl } from '../utils/api';
import SkillTag from '../components/SkillTag';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    api.get(`/profile/${userId}`).then(({ data }) => {
      if (data?.success && data?.data) {
        setProfile(data.data);
        if (data.data.avatarS3Key) {
          getAvatarViewUrl(data.data.avatarS3Key).then(setAvatarUrl);
        }
      }
    }).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-founder-bg">
        <div className="text-founder-accent animate-pulse">Loading…</div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-founder-bg">
        <p className="text-zinc-400">Profile not found</p>
        <button onClick={() => navigate(-1)} className="ml-4 text-founder-accent">Go back</button>
      </div>
    );
  }

  const initials = (profile.name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-founder-bg pb-24">
      <div className="max-w-xl mx-auto px-4 pt-8">
        <div className="rounded-2xl bg-founder-card border border-[var(--border)] p-6">
          <div className="flex gap-5 items-start">
            <div className="w-20 h-20 rounded-2xl bg-founder-card border border-[var(--border)] overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-founder-accent text-xl font-bold bg-founder-accent/20">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">{profile.name || 'Anonymous'}</h1>
              {(profile.university || profile.graduationYear) && (
                <p className="text-sm text-zinc-400 mt-0.5">
                  {[profile.university, profile.graduationYear].filter(Boolean).join(' · ')}
                </p>
              )}
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-founder-accent/20 text-founder-accent">
                {profile.userType === 'founder' ? 'Founder' : 'Builder'}
              </span>
            </div>
          </div>
          {profile.bio && (
            <p className="mt-4 text-zinc-300 text-sm">{profile.bio}</p>
          )}
          {profile.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.skills.map((s) => (
                <SkillTag key={s} label={s} active />
              ))}
            </div>
          )}
          {profile.githubUsername && (
            <a
              href={`https://github.com/${profile.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-sm text-founder-accent hover:underline"
            >
              GitHub: {profile.githubUsername}
            </a>
          )}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-zinc-400 hover:text-white text-sm"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
