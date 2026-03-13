import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export function MatchModal({ user, onClose }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [composed, setComposed] = useState(false);

  const handleCompose = async () => {
    if (!user?.userId || composed) return;
    setLoading(true);
    try {
      const { data } = await api.post('/outreach/compose', { toUserId: user.userId });
      if (data?.success && data?.data?.draft) {
        setDraft(data.data.draft);
        setComposed(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    onClose();
    navigate('/swipe');
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-founder-card border border-[var(--border)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-6">It&apos;s a match!</h2>
        <div className="flex justify-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-founder-accent/20 flex items-center justify-center text-founder-accent text-lg font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium mt-2">{user?.name || 'Them'}</span>
          </div>
        </div>
        {!composed ? (
          <button
            onClick={handleCompose}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-founder-accent text-white font-medium hover:bg-founder-accentHover disabled:opacity-50"
          >
            {loading ? 'Composing…' : 'Compose outreach'}
          </button>
        ) : (
          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0d0d0d] border border-[var(--border)] text-white placeholder:text-[var(--text-muted)] focus:border-founder-accent outline-none resize-none h-32"
              placeholder="Edit your message..."
            />
            <button
              onClick={handleDone}
              className="w-full py-3 rounded-xl bg-founder-accent text-white font-medium hover:bg-founder-accentHover disabled:opacity-50"
            >
              Done
            </button>
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-[var(--text-muted)] hover:text-white text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
