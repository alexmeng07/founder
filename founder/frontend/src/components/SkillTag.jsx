export default function SkillTag({ label, active = false, onRemove }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-founder-accent text-white' : 'bg-founder-card text-zinc-400 border border-zinc-700'
      }`}
    >
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className="hover:text-white ml-0.5 -mr-0.5" aria-label="Remove">
          ×
        </button>
      )}
    </span>
  );
}
