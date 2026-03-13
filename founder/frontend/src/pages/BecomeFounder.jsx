import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoProjects } from '../context/DemoProjectsContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { PROJECT_TAGS } from '../data/demoData';

const GOALS = [
  { value: 'learn', label: 'Learn' },
  { value: 'network', label: 'Network' },
  { value: 'startup', label: 'Startup' },
];

export function BecomeFounder() {
  const navigate = useNavigate();
  const { addDemoProject } = useDemoProjects();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: [],
    rolesNeeded: [],
    goal: 'startup',
    tags: [],
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

  const toggleTag = (t) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      if (user) {
        const { data } = await api.post('/projects', {
          title: form.title.trim(),
          description: form.description || '',
          techStack: form.techStack,
          rolesNeeded: form.rolesNeeded,
          goal: form.goal,
          tags: form.tags,
          teamSizeTarget: form.teamSizeTarget,
        });
        if (data?.success && data?.data?.projectId) {
          setSubmitted(true);
          navigate('/feed', { state: { highlightProjectId: data.data.projectId } });
          return;
        }
      }
      const newProject = addDemoProject({
        title: form.title.trim(),
        description: form.description || '',
        techStack: form.techStack,
        rolesNeeded: form.rolesNeeded,
        goal: form.goal,
        tags: form.tags,
        teamSizeTarget: form.teamSizeTarget,
      });
      setSubmitted(true);
      navigate('/feed', { state: { highlightProjectId: newProject.projectId } });
    } catch (err) {
      console.error(err);
      const newProject = addDemoProject({
        title: form.title.trim(),
        description: form.description || '',
        techStack: form.techStack,
        rolesNeeded: form.rolesNeeded,
        goal: form.goal,
        tags: form.tags,
        teamSizeTarget: form.teamSizeTarget,
      });
      setSubmitted(true);
      navigate('/feed', { state: { highlightProjectId: newProject.projectId } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-lg mx-auto px-4 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black font-logo mb-2">Become a founder.</h1>
          <p className="text-gray-600">Share your project idea and find co-founders who want to build with you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-purple-100 text-black placeholder:text-gray-400 focus:border-founder-purple focus:ring-2 focus:ring-founder-purple/20 outline-none transition-all"
              placeholder="e.g. AI-powered study planner"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-purple-100 text-black placeholder:text-gray-400 focus:border-founder-purple focus:ring-2 focus:ring-founder-purple/20 outline-none resize-none h-28 transition-all"
              placeholder="What's the idea? Tech stack? Who are you looking for?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tech stack</label>
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
                className="px-4 py-3 rounded-xl bg-founder-purple text-white font-medium hover:bg-founder-purpleLight transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.techStack.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-founder-purple/10 text-founder-purple text-sm font-medium"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTech(t)}
                    className="text-founder-purple/70 hover:text-founder-purple"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Roles needed</label>
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
                className="px-4 py-3 rounded-xl bg-founder-purple text-white font-medium hover:bg-founder-purpleLight transition-colors"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all capitalize ${
                    form.tags.includes(t)
                      ? 'bg-founder-purple text-white shadow-md shadow-founder-purple/30'
                      : 'bg-purple-50 text-gray-600 hover:bg-founder-purple/10 hover:text-founder-purple border border-purple-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
            <div className="flex gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, goal: g.value }))}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    form.goal === g.value
                      ? 'bg-founder-purple text-white shadow-md shadow-founder-purple/30'
                      : 'bg-purple-50 text-gray-600 hover:bg-founder-purple/10 hover:text-founder-purple border border-purple-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team size target: {form.teamSizeTarget}
            </label>
            <input
              type="range"
              min={2}
              max={6}
              value={form.teamSizeTarget}
              onChange={(e) => setForm((f) => ({ ...f, teamSizeTarget: parseInt(e.target.value, 10) }))}
              className="w-full accent-founder-purple"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-founder-purple to-founder-purpleLight text-white font-semibold hover:shadow-lg hover:shadow-founder-purple/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit proposal'}
          </button>
        </form>
      </div>
    </div>
  );
}
