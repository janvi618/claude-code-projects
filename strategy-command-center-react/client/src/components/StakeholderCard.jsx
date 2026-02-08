import ReactMarkdown from 'react-markdown';

const stakeholderColors = {
  cfo: { border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  ceo: { border: 'border-l-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  cmo: { border: 'border-l-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  sales_vp: { border: 'border-l-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-400' }
};

export default function StakeholderCard({ stakeholderKey, data }) {
  const colors = stakeholderColors[stakeholderKey] || stakeholderColors.ceo;

  return (
    <div className={`glass-card p-6 border-l-4 ${colors.border}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
          <span className={`text-lg font-bold ${colors.text}`}>
            {data.title?.charAt(0) || '?'}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">{data.name}</h3>
          <p className="text-sm text-slate-400">{data.focus}</p>
        </div>
      </div>

      {/* Simulation content */}
      {data.simulation && (
        <div className="markdown-content text-sm">
          <ReactMarkdown>{data.simulation}</ReactMarkdown>
        </div>
      )}

      {/* Quick stats */}
      {data.cares_about && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Priorities</p>
          <div className="flex flex-wrap gap-2">
            {data.cares_about.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
