import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const GOALS = [
  { value: 'learn', label: 'Learn' },
  { value: 'network', label: 'Network' },
  { value: 'startup', label: 'Startup' },
];

export function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: [],
    rolesNeeded: [],
    goal: 'startup',
    teamSizeTarget: 4,
  });
  const [techInput, setTechInput] = useState('');
  const [rolesInput, setRolesInput] = useState('');

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.techStack.includes(t)) {
      setForm((f) => ({ ...f, techStack: [...f.techStack, t] }));
      setTechInput('');
    }
  };

  const removeTech = (t) => {
    setForm((f) => ({ ...f, techStack: f.techStack.filter((x) => x !== t) }));
  };

  const addRole = () => {
    const r = rolesInput.trim();
    if (r && !form.rolesNeeded.includes(r)) {
      setForm((f) => ({ ...f, rolesNeeded: [...f.rolesNeeded, r] }));
      setRolesInput('');
    }
  };

  const removeRole = (r) => {
    setForm((f) => ({ ...f, rolesNeeded: f.rolesNeeded.filter((x) => x !== r) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      if (data?.success) {
        navigate('/feed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-12 px-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">Create project</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white border-2 border-purple-100 text-black placeholder:text-gray-400 focus:border-founder-purple focus:ring-2 focus:ring-founder-purple/20 outline-none"
            placeholder="e.g. AI-powered study planner"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white border-2 border-purple-100 text-black placeholder:text-gray-400 focus:border-founder-purple outline-none resize-none h-28"
            placeholder="What's the idea? Tech stack? Who are you looking for?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
            Tech stack
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
              className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-purple-100 text-black placeholder:text-gray-400 focus:border-founder-purple outline-none"
              placeholder="React, Node..."
            />
            <button
              type="button"
              onClick={addTech}
              className="px-4 py-3 rounded-xl bg-founder-purple text-white font-medium hover:bg-founder-purpleLight"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.techStack.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--border)] text-sm"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTech(t)}
                  className="text-[var(--text-muted)] hover:text-black"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
            Roles needed
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={rolesInput}
              onChange={(e) => setRolesInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
              className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-purple-100 text-black placeholder:text-gray-400 focus:border-founder-purple outline-none"
              placeholder="e.g. frontend, ML engineer..."
            />
            <button
              type="button"
              onClick={addRole}
              className="px-4 py-3 rounded-xl bg-founder-purple text-white font-medium hover:bg-founder-purpleLight"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.rolesNeeded.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-founder-purple/10 text-founder-purple text-sm font-medium"
              >
                {r}
                <button
                  type="button"
                  onClick={() => removeRole(r)}
                  className="text-founder-purple/70 hover:text-founder-purple"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Goal</label>
          <div className="flex gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, goal: g.value }))}
                className={`px-4 py-2 rounded-lg text-sm ${
                  form.goal === g.value
                    ? 'bg-founder-purple text-white'
                    : 'bg-purple-50 text-gray-600 hover:text-founder-purple border border-purple-100'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Team size target: {form.teamSizeTarget}
          </label>
          <input
            type="range"
            min={2}
            max={6}
            value={form.teamSizeTarget}
            onChange={(e) =>
              setForm((f) => ({ ...f, teamSizeTarget: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-founder-purple"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-founder-accent text-white font-medium hover:bg-founder-accentHover disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create project'}
        </button>
      </form>
    </div>
  );
}
