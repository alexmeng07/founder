import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getAvatarViewUrl } from '../utils/api';
import SkillTag from '../components/SkillTag';
import { DEMO_USERS } from '../data/demoData';

const UOFT_LOGO_URL = '/uoft-logo.svg';

function SocialButton({ href, icon, label }) {
  if (!href) return null;
  const isMail = href.startsWith('mailto:');
  return (
    <a
      href={href}
      target={isMail ? '_self' : '_blank'}
      rel={isMail ? undefined : 'noopener noreferrer'}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-100 text-founder-purple hover:bg-founder-purple/10 hover:border-founder-purple/30 transition-all"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const isDemo = userId.startsWith('demo-');
    api.get(`/profile/${userId}`).then(({ data }) => {
      if (data?.success && data?.data) {
        setProfile(data.data);
        if (data.data.avatarS3Key) {
          getAvatarViewUrl(data.data.avatarS3Key).then(setAvatarUrl);
        }
      } else if (isDemo) {
        const demoUser = DEMO_USERS.find((u) => u.userId === userId);
        setProfile(demoUser || null);
      }
    }).catch(() => {
      if (isDemo) {
        const demoUser = DEMO_USERS.find((u) => u.userId === userId);
        setProfile(demoUser || null);
      } else {
        setProfile(null);
      }
    }).finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-founder-purple animate-pulse">Loading…</div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Profile not found</p>
        <button onClick={() => navigate(-1)} className="ml-4 text-founder-purple">Go back</button>
      </div>
    );
  }

  const initials = (profile.name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const isDemo = userId?.startsWith('demo-');
  const email = profile.email || (isDemo && profile.university?.includes('Toronto') ? `${profile.name?.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@utoronto.ca` : null);
  const githubUrl = profile.githubUsername ? `https://github.com/${profile.githubUsername}` : null;
  const linkedinUrl = profile.linkedinUrl || null;
  const discordHandle = profile.discordHandle || null;

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-xl mx-auto px-4 pt-8">
        <div className="rounded-2xl bg-white border-2 border-purple-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6">
            <div className="flex gap-5 items-start">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-purple-50 border-2 border-purple-100 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-founder-purple text-xl font-bold bg-founder-purple/10">
                      {initials}
                    </div>
                  )}
                </div>
                {isDemo && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-white border-2 border-purple-100 flex items-center justify-center overflow-hidden shadow-sm">
                    <img src={UOFT_LOGO_URL} alt="UofT" className="w-6 h-6 object-contain" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-black">{profile.name || 'Anonymous'}</h1>
                {(profile.university || profile.graduationYear) && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {[profile.university, profile.graduationYear].filter(Boolean).join(' · ')}
                  </p>
                )}
                {profile.currentPlaceOfEmployment && (
                  <p className="text-sm text-founder-purple mt-1 font-medium">
                    {profile.currentPlaceOfEmployment}
                  </p>
                )}
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-founder-purple/10 text-founder-purple">
                  Builder
                </span>
              </div>
            </div>
            {profile.bio && (
              <p className="mt-4 text-gray-700 text-sm">{profile.bio}</p>
            )}
            {profile.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.skills.map((s) => (
                  <SkillTag key={s} label={s} active />
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-purple-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Connect</p>
              <div className="flex flex-wrap gap-2">
                <SocialButton href={email ? `mailto:${email}` : null} icon="✉" label="Email" />
                <SocialButton href={githubUrl} icon="⚙" label="GitHub" />
                <SocialButton href={linkedinUrl} icon="◆" label="LinkedIn" />
                {discordHandle && (
                  <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-100 text-founder-purple">
                    <span className="text-lg">💬</span>
                    <span className="text-sm font-medium">{discordHandle}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-gray-500 hover:text-founder-purple text-sm transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
