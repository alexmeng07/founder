import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ProjectCard } from '../components/ProjectCard';

export function Feed() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextKey, setNextKey] = useState(null);

  const fetchFeed = async (append = false) => {
    try {
      const params = nextKey && append ? { lastKey: nextKey } : {};
      const { data } = await api.get('/projects/feed', { params });
      if (data?.success && data?.data) {
        const { projects: list, nextKey: nk } = data.data;
        setProjects((prev) => (append ? [...prev, ...list] : list));
        setNextKey(nk || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLike = (project) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.projectId === project.projectId
          ? { ...p, likesCount: (p.likesCount || 0) + 1 }
          : p
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="space-y-4">
        {projects.map((p) => (
          <ProjectCard key={p.projectId} project={p} onLike={handleLike} />
        ))}
      </div>
      {nextKey && (
        <button
          onClick={() => fetchFeed(true)}
          className="w-full mt-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:border-founder-accent transition-colors"
        >
          Load more
        </button>
      )}
      {!loading && projects.length === 0 && (
        <p className="text-[var(--text-muted)] text-center py-12">No projects yet.</p>
      )}
    </div>
  );
}
