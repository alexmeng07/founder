import { useNavigate } from 'react-router-dom';

export function MatchModal({ user, onClose }) {
  const navigate = useNavigate();

  const handleCompose = () => {
    if (!user?.userId) return;
    onClose();
    navigate(`/messages?with=${user.userId}`);
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
        className="w-full max-w-md rounded-2xl bg-white border-2 border-purple-100 shadow-xl shadow-founder-purple/10 p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-6 text-founder-purple">Creating a new message</h2>
        <div className="flex justify-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-founder-purple/20 flex items-center justify-center text-founder-purple text-lg font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium mt-2">{user?.name || 'Them'}</span>
          </div>
        </div>
        <button
          onClick={handleCompose}
          className="w-full py-3 rounded-xl bg-founder-purple text-white font-medium hover:bg-founder-purpleLight transition-colors"
        >
          Open message
        </button>
        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-[var(--text-muted)] hover:text-black text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
