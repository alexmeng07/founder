import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkillTag from './SkillTag';
import { api } from '../utils/api';

const GOAL_LABELS = { learn: 'Learn', network: 'Network', startup: 'Startup', hackathon: 'Hackathon', research: 'Research' };

export function ProjectCard({ project, onLike }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading || liked) return;
    const isDemo = project.projectId?.startsWith('demo-');
    if (isDemo) {
      setLiked(true);
      onLike?.(project);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${project.projectId}/like`);
      if (data?.success) {
        setLiked(true);
        onLike?.(project);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const initials = (project?.ownerName || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const imageUrl = project.imageUrl || project.coverImageUrl;

  return (
    <article className="rounded-2xl bg-white border border-purple-100 overflow-hidden shadow-sm hover:shadow-md hover:shadow-founder-purple/5 transition-all duration-300 animate-fade-in">
      {imageUrl && (
        <div className="aspect-[5/3] w-full overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-bold text-lg text-black flex-1">{project.title}</h3>
          <div className="flex gap-1 flex-shrink-0">
            {(project.tags || [project.goal]).filter((t) => t && t !== 'project').slice(0, 2).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-founder-purple">
                {GOAL_LABELS[t] || t}
              </span>
            ))}
          </div>
        </div>
        {project.description && (
          <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-3">{project.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(project.techStack || []).map((t) => (
            <SkillTag key={t} label={t} active={false} />
          ))}
        </div>
        {project.rolesNeeded?.length > 0 && (
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Looking for: {project.rolesNeeded.join(', ')}
          </p>
        )}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
          <button
            onClick={() => project.ownerId && navigate(`/profile/${project.ownerId}`)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-black text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium">{project.ownerName || 'Unknown'}</span>
          </button>
          <button
            onClick={handleLike}
            disabled={loading}
            className={`p-2 rounded-full transition-all ${
              liked ? 'text-founder-purple scale-110' : 'text-[var(--text-muted)] hover:text-founder-purple/80'
            }`}
            aria-label="Like"
          >
            <span className="text-xl">{liked ? '♥' : '♡'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
