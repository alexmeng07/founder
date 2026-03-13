import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Fuse from 'fuse.js';
import { api } from '../utils/api';
import { ProjectCard } from '../components/ProjectCard';
import { DEMO_PROJECTS, PROJECT_TAGS } from '../data/demoData';
import { useDemoProjects } from '../context/DemoProjectsContext';

export function Feed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { demoProjects } = useDemoProjects();
  const highlightProjectId = location.state?.highlightProjectId;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextKey, setNextKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  const fetchFeed = async (append = false) => {
    const hasApi = !!import.meta.env.VITE_API_URL;
    try {
      if (!hasApi && !append) {
        setProjects(DEMO_PROJECTS);
        setNextKey(null);
      } else {
        const params = nextKey && append ? { lastKey: nextKey } : {};
        const { data } = await api.get('/projects/feed', {
          params,
          timeout: 8000,
        });
        if (data?.success && data?.data?.projects?.length > 0) {
          const { projects: list, nextKey: nk } = data.data;
          setProjects((prev) => (append ? [...prev, ...list] : list));
          setNextKey(nk || null);
        } else if (!append) {
          setProjects(DEMO_PROJECTS);
          setNextKey(null);
        }
      }
    } catch (e) {
      console.error(e);
      if (!append) {
        setProjects(DEMO_PROJECTS);
        setNextKey(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const allProjects = useMemo(() => [...demoProjects, ...projects], [demoProjects, projects]);

  const filteredProjects = useMemo(() => {
    let list = allProjects;
    if (activeFilters.length > 0) {
      list = list.filter((p) =>
        (p.tags || []).some((t) => activeFilters.includes(t))
      );
    }
    if (searchQuery.trim()) {
      try {
        const fuse = new Fuse(list, {
          keys: ['title', 'description', 'techStack', 'tags'],
          threshold: 0.4,
        });
        const results = fuse.search(searchQuery);
        list = results.map((r) => r.item);
      } catch (err) {
        console.error('Fuse search error:', err);
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            (p.techStack || []).some((t) => t?.toLowerCase?.().includes(q)) ||
            (p.tags || []).some((t) => t?.toLowerCase?.().includes(q))
        );
      }
    }
    return list;
  }, [allProjects, searchQuery, activeFilters]);

  const hasScrolledToHighlight = useRef(false);
  useEffect(() => {
    if (!highlightProjectId || hasScrolledToHighlight.current) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`project-${highlightProjectId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-founder-purple', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-founder-purple', 'ring-offset-2'), 2500);
        hasScrolledToHighlight.current = true;
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [highlightProjectId, filteredProjects]);

  const toggleFilter = (tag) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleLike = (project) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.projectId === project.projectId
          ? { ...p, likesCount: (p.likesCount || 0) + 1 }
          : p
      )
    );
    if (project?.ownerId) {
      navigate(`/messages?with=${project.ownerId}&from=feed`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-12 px-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-black mb-4 animate-fade-in">Projects</h1>
      <div className="mb-6 space-y-3">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-purple-100 text-black placeholder:text-gray-400 focus:border-founder-purple focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {PROJECT_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleFilter(tag)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all capitalize ${
                activeFilters.includes(tag)
                  ? 'bg-founder-purple text-white'
                  : 'bg-purple-50 text-gray-600 hover:bg-founder-purple/10 border border-purple-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {filteredProjects.map((p) => (
          <div key={p.projectId} id={`project-${p.projectId}`} className="scroll-mt-24 rounded-2xl transition-all duration-300">
            <ProjectCard project={p} onLike={handleLike} />
          </div>
        ))}
      </div>
      {nextKey && (
        <button
          onClick={() => fetchFeed(true)}
          className="w-full mt-6 py-3 rounded-xl border-2 border-purple-100 text-founder-purple hover:bg-purple-50 transition-colors"
        >
          Load more
        </button>
      )}
      {!loading && filteredProjects.length === 0 && (
        <p className="text-[var(--text-muted)] text-center py-12">
          {allProjects.length === 0 ? 'No projects yet.' : 'No projects match your filters.'}
        </p>
      )}
    </div>
  );
}
