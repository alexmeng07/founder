import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useAuth } from '../context/AuthContext';
import { useDemoProfile } from '../context/DemoProfileContext';
import { api } from '../utils/api';
import SkillTag from '../components/SkillTag';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function Profile() {
  const { userId } = useAuth();
  const { savedProfile, setSavedProfile } = useDemoProfile();
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
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    if (!loading) {
      const hasData = profile?.name || profile?.bio || (profile?.skills?.length > 0);
      const hasSaved = savedProfile?.name || savedProfile?.bio || (savedProfile?.skills?.length > 0);
      if (!hasData && !hasSaved) {
        setIsEditing(true);
      }
    }
  }, [loading, profile?.name, profile?.bio, profile?.skills, savedProfile?.name, savedProfile?.bio, savedProfile?.skills]);

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
    const profileData = {
      name: form.name,
      bio: form.bio,
      university: form.university,
      graduationYear: form.graduationYear,
      skills: form.skills,
      interests: form.interests,
      linkedinUrl: form.linkedinUrl,
      githubUsername: form.githubUsername,
      discordHandle: form.discordHandle,
    };
    setSavedProfile(profileData);
    try {
      const { data } = await api.put('/profile', { ...form, userType: 'builder', githubRepos });
      if (data.success) setProfile(data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
    setIsEditing(false);
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
      try {
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buf).promise;
        let text = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((it) => it.str).join(' ') + ' ';
        }
        const techTerms = ['Python', 'JavaScript', 'React', 'Node', 'TypeScript', 'Java', 'Rust', 'Go', 'C++', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'TensorFlow', 'PyTorch', 'MongoDB', 'PostgreSQL'];
        const foundSkills = techTerms.filter((t) => text.toLowerCase().includes(t.toLowerCase()));
        const skillsMatch = text.match(/(?:skills?|technical|technologies?)[:\s]+([\w\s,/.+-]+?)(?=\n|$)/i);
        const extraSkills = skillsMatch ? skillsMatch[1].split(/[\s,]+/).filter((s) => s.length > 2).slice(0, 8) : [];
        const skills = [...new Set([...foundSkills, ...extraSkills])].slice(0, 12);
        const eduMatch = text.match(/(?:university|education|institution|degree)[:\s]+([^\n]{3,60})/i);
        const university = eduMatch ? eduMatch[1].trim() : '';
        const summaryMatch = text.match(/(?:summary|objective|about|profile)[:\s]+([^\n]{20,300})/i);
        const bio = summaryMatch ? summaryMatch[1].trim().slice(0, 200) : '';
        setForm((f) => ({
          ...f,
          skills: skills.length ? skills : f.skills,
          bio: bio || f.bio,
          university: university || f.university,
        }));
      } catch (parseErr) {
        setError(err.response?.data?.error || err.message || 'Resume parse failed. Add details manually.');
      }
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
      try {
        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(form.githubUsername.trim())}/repos?sort=updated&per_page=6`,
          { headers: { Accept: 'application/vnd.github.v3+json' } }
        );
        if (res.ok) {
          const repos = await res.json();
          setGithubRepos(repos.map((r) => ({ name: r.name, language: r.language })));
        } else {
          setError(err.response?.data?.error || 'GitHub fetch failed');
        }
      } catch {
        setError(err.response?.data?.error || 'GitHub fetch failed');
      }
    }
  };

  const getAvatarUrl = (key) => {
    if (!key) return null;
    const base = import.meta.env.VITE_API_URL || '';
    return `${base}/profile/avatar-view?key=${encodeURIComponent(key)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-founder-accent animate-pulse">Loading profile…</div>
      </div>
    );
  }

  const displayProfile = savedProfile || profile;

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold text-black mb-6">Profile</h1>

        {!isEditing && displayProfile && (displayProfile.name || displayProfile.bio || displayProfile.skills?.length) && (
          <>
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 p-6 mb-6 animate-fade-in">
              <h2 className="text-sm font-medium text-founder-purple mb-4">Your unified profile</h2>
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-xl bg-founder-purple/20 flex items-center justify-center text-founder-purple text-xl font-bold flex-shrink-0">
                  {(displayProfile.name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-black">{displayProfile.name || 'Anonymous'}</h3>
                  {(displayProfile.university || displayProfile.graduationYear) && (
                    <p className="text-sm text-purple-600 mt-0.5">
                      {[displayProfile.university, displayProfile.graduationYear].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {displayProfile.bio && <p className="text-sm text-gray-700 mt-2">{displayProfile.bio}</p>}
                  {(displayProfile.skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {displayProfile.skills.map((s) => (
                        <SkillTag key={s} label={s} active />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all mb-8"
            >
              Edit
            </button>
          </>
        )}

        {isEditing && (
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
                <span className="text-3xl text-gray-400">?</span>
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
                className="text-founder-purple hover:underline text-sm"
              >
                Change avatar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple resize-none"
              placeholder="Short intro"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">University</label>
              <input
                value={form.university}
                onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple"
                placeholder="e.g. Stanford"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Graduation</label>
              <input
                value={form.graduationYear}
                onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple"
                placeholder="e.g. 2026"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTag('skills', skillInput))
                }
                className="flex-1 px-4 py-2 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple"
                placeholder="Add skill"
              />
              <button
                type="button"
                onClick={() => addTag('skills', skillInput)}
                className="px-4 py-2 rounded-xl bg-founder-purple hover:bg-founder-purpleLight text-white text-sm"
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
            <label className="block text-sm text-gray-500 mb-1">Interests</label>
            <div className="flex gap-2 mb-2">
              <input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTag('interests', interestInput))
                }
                className="flex-1 px-4 py-2 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple"
                placeholder="Add interest"
              />
              <button
                type="button"
                onClick={() => addTag('interests', interestInput)}
                className="px-4 py-2 rounded-xl bg-founder-purple hover:bg-founder-purpleLight text-white text-sm"
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
            <label className="block text-sm text-gray-500 mb-1">GitHub</label>
            <div className="flex gap-2">
              <input
                value={form.githubUsername}
                onChange={(e) => setForm((f) => ({ ...f, githubUsername: e.target.value }))}
                className="flex-1 px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple"
                placeholder="username"
              />
              <button
                type="button"
                onClick={handleGithubConnect}
                className="px-4 py-3 rounded-xl bg-founder-purple hover:bg-founder-purpleLight text-white"
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
                    className="block text-sm text-gray-500 hover:text-founder-accent"
                  >
                    {r.name} — {r.language || '—'}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleResumeUpload(e.target.files?.[0])}
              disabled={resumeParsing}
              className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-founder-accent file:text-white"
            />
            {resumeParsing && <p className="text-sm text-founder-accent mt-1">Parsing…</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">LinkedIn</label>
              <input
                value={form.linkedinUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Devpost</label>
              <input
                value={form.devpostUrl}
                onChange={(e) => setForm((f) => ({ ...f, devpostUrl: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple"
                placeholder="https://devpost.com/..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Instagram</label>
              <input
                value={form.instagramHandle}
                onChange={(e) => setForm((f) => ({ ...f, instagramHandle: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple"
                placeholder="@handle"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Discord</label>
              <input
                value={form.discordHandle}
                onChange={(e) => setForm((f) => ({ ...f, discordHandle: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-founder-card border border-[var(--border)] text-black focus:outline-none focus:ring-2 focus:ring-founder-purple"
                placeholder="handle#1234"
              />
            </div>
          </div>

          {(form.githubUsername || form.linkedinUrl || form.discordHandle) && (
            <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick links</p>
              <div className="flex flex-wrap gap-2">
                {form.githubUsername && (
                  <a href={`https://github.com/${form.githubUsername}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-white border border-purple-100 text-founder-purple text-sm hover:bg-founder-purple/5">
                    GitHub
                  </a>
                )}
                {form.linkedinUrl && (
                  <a href={form.linkedinUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-white border border-purple-100 text-founder-purple text-sm hover:bg-founder-purple/5">
                    LinkedIn
                  </a>
                )}
                {form.discordHandle && (
                  <span className="px-3 py-2 rounded-lg bg-white border border-purple-100 text-founder-purple text-sm">
                    Discord: {form.discordHandle}
                  </span>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-founder-purple hover:bg-founder-purpleLight text-white font-medium transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
        )}

        {!displayProfile?.name && !displayProfile?.bio && !displayProfile?.skills?.length && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-founder-purple text-white font-medium hover:bg-founder-purpleLight transition-all"
          >
            Add your profile
          </button>
        )}
      </div>
    </div>
  );
}
