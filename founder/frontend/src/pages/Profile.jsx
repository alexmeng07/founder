import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import SkillTag from '../components/SkillTag';

export default function Profile() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    bio: '',
    university: '',
    graduationYear: '',
    userType: 'builder',
    skills: [],
    interests: [],
    linkedinUrl: '',
    devpostUrl: '',
    instagramHandle: '',
    discordHandle: '',
    githubUsername: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [githubRepos, setGithubRepos] = useState([]);
  const [resumeParsing, setResumeParsing] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    api
      .get(`/profile/${userId}`)
      .then(({ data }) => {
        if (data.success && data.data) {
          const p = data.data;
          setProfile(p);
          setForm({
            name: p.name ?? '',
            bio: p.bio ?? '',
            university: p.university ?? '',
            graduationYear: p.graduationYear ?? '',
            userType: p.userType ?? 'builder',
            skills: p.skills ?? [],
            interests: p.interests ?? [],
            linkedinUrl: p.linkedinUrl ?? '',
            devpostUrl: p.devpostUrl ?? '',
            instagramHandle: p.instagramHandle ?? '',
            discordHandle: p.discordHandle ?? '',
            githubUsername: p.githubUsername ?? '',
          });
          setGithubRepos(p.githubRepos ?? []);
        }
      })
      .catch(() => setProfile({}))
      .finally(() => setLoading(false));
  }, [userId]);

  const addTag = (key, value) => {
    const v = value.trim();
    if (!v) return;
    setForm((f) => {
      const arr = f[key];
      if (arr.includes(v)) return f;
      return { ...f, [key]: [...arr, v] };
    });
    if (key === 'skills') setSkillInput('');
    else setInterestInput('');
  };

  const removeTag = (key, idx) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await api.put('/profile', { ...form, githubRepos });
      if (data.success) setProfile(data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setError('');
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const { data } = await api.get(`/profile/avatar-url?ext=${ext}&type=avatar`);
      if (!data.success || !data.data?.uploadUrl) throw new Error('Could not get upload URL');
      const res = await fetch(data.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      });
      if (res.ok && data.data.s3Key) {
        await api.put('/profile', { ...form, githubRepos, avatarS3Key: data.data.s3Key });
        setProfile((p) => ({ ...p, avatarS3Key: data.data.s3Key }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setError(err.message || 'Avatar upload failed');
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    setResumeParsing(true);
    setError('');
    try {
      const { data: urlData } = await api.get('/profile/avatar-url?ext=pdf&type=resume');
      if (!urlData.success || !urlData.data?.uploadUrl) throw new Error('Could not get upload URL');
      const res = await fetch(urlData.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: file,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { data } = await api.post('/profile/resume', { s3Key: urlData.data.s3Key });
      if (data.success && data.data) {
        setForm((f) => ({
          ...f,
          skills: data.data.skills ?? f.skills,
          bio: data.data.bio || f.bio,
          university: data.data.university || f.university,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Resume parse failed');
    } finally {
      setResumeParsing(false);
    }
  };

  const handleGithubConnect = async () => {
    if (!form.githubUsername?.trim()) return;
    setError('');
    try {
      const { data } = await api.post('/profile/github', {
        githubUsername: form.githubUsername.trim(),
      });
      if (data.success && data.data?.repos) {
        setGithubRepos(data.data.repos);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'GitHub fetch failed');
    }
  };

  const getAvatarUrl = (key) => {
    if (!key) return null;
    const base = import.meta.env.VITE_API_URL || '';
    return `${base}/profile/avatar-view?key=${encodeURIComponent(key)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-founder-bg">
        <div className="text-founder-accent animate-pulse">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-founder-bg pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold text-white mb-8">Profile</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex gap-6 items-start">
            <div className="w-24 h-24 rounded-2xl bg-founder-card border border-[var(--border)] flex items-center justify-center overflow-hidden">
              {profile?.avatarS3Key ? (
                <img
                  src={getAvatarUrl(profile.avatarS3Key)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-zinc-500">?</span>
              )}
            </div>
            <div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="text-founder-accent hover:underline text-sm"
              >
                Change avatar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent resize-none"
              placeholder="Short intro"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">University</label>
              <input
                value={form.university}
                onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
                placeholder="e.g. Stanford"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Graduation</label>
              <input
                value={form.graduationYear}
                onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
                placeholder="e.g. 2026"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">I am a</label>
            <select
              value={form.userType}
              onChange={(e) => setForm((f) => ({ ...f, userType: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
            >
              <option value="builder">Builder</option>
              <option value="founder">Founder</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTag('skills', skillInput))
                }
                className="flex-1 px-4 py-2 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
                placeholder="Add skill"
              />
              <button
                type="button"
                onClick={() => addTag('skills', skillInput)}
                className="px-4 py-2 rounded-xl bg-founder-accent hover:bg-founder-accentHover text-white text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((s, i) => (
                <SkillTag
                  key={i}
                  label={s}
                  active
                  onRemove={() => removeTag('skills', i)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Interests</label>
            <div className="flex gap-2 mb-2">
              <input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTag('interests', interestInput))
                }
                className="flex-1 px-4 py-2 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
                placeholder="Add interest"
              />
              <button
                type="button"
                onClick={() => addTag('interests', interestInput)}
                className="px-4 py-2 rounded-xl bg-founder-accent hover:bg-founder-accentHover text-white text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.interests.map((s, i) => (
                <SkillTag
                  key={i}
                  label={s}
                  active={false}
                  onRemove={() => removeTag('interests', i)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">GitHub</label>
            <div className="flex gap-2">
              <input
                value={form.githubUsername}
                onChange={(e) => setForm((f) => ({ ...f, githubUsername: e.target.value }))}
                className="flex-1 px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
                placeholder="username"
              />
              <button
                type="button"
                onClick={handleGithubConnect}
                className="px-4 py-3 rounded-xl bg-founder-accent hover:bg-founder-accentHover text-white"
              >
                Fetch repos
              </button>
            </div>
            {githubRepos.length > 0 && (
              <div className="mt-2 space-y-1">
                {githubRepos.map((r, i) => (
                  <a
                    key={i}
                    href={`https://github.com/${form.githubUsername}/${r.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-zinc-400 hover:text-founder-accent"
                  >
                    {r.name} — {r.language || '—'}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleResumeUpload(e.target.files?.[0])}
              disabled={resumeParsing}
              className="block text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-founder-accent file:text-white"
            />
            {resumeParsing && <p className="text-sm text-founder-accent mt-1">Parsing…</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">LinkedIn</label>
              <input
                value={form.linkedinUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Devpost</label>
              <input
                value={form.devpostUrl}
                onChange={(e) => setForm((f) => ({ ...f, devpostUrl: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
                placeholder="https://devpost.com/..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Instagram</label>
              <input
                value={form.instagramHandle}
                onChange={(e) => setForm((f) => ({ ...f, instagramHandle: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
                placeholder="@handle"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Discord</label>
              <input
                value={form.discordHandle}
                onChange={(e) => setForm((f) => ({ ...f, discordHandle: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-white focus:outline-none focus:ring-2 focus:ring-founder-accent"
                placeholder="handle#1234"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-founder-accent hover:bg-founder-accentHover text-white font-medium transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
