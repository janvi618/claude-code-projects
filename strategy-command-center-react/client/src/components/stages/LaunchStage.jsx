import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../../context/AppContext';

export default function LaunchStage() {
  const { state, actions } = useApp();
  const [downloadStatus, setDownloadStatus] = useState(null);

  // Generate full report content
  const generateFullReport = () => {
    const now = new Date().toISOString().split('T')[0];

    return `# Strategy Command Center Report
Generated: ${now}

---

## Original Threat
${state.threatText}

---

## Threat Analysis
${state.analysis}

---

## Intelligence Report
${state.intelReport}

---

## Selected Response Strategy
${state.selectedResponse}

---

## Stakeholder Simulations

${Object.entries(state.stakeholderSimulations || {}).map(([key, data]) =>
  `### ${data.name} (${data.title})
${data.simulation}`
).join('\n\n')}

---

## Red Team Analysis
${state.redTeamAnalysis}

---

## Scenario Projections
${state.scenarioChains}

---

## Launch Materials
${state.launchMaterials}
`;
  };

  // Generate HTML report
  const generateHtmlReport = () => {
    const content = generateFullReport();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Strategy Command Center Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 { color: #a78bfa; border-bottom: 2px solid #7c3aed; padding-bottom: 0.5rem; }
    h2 { color: #c4b5fd; margin-top: 2rem; }
    h3 { color: #ddd6fe; }
    hr { border: none; border-top: 1px solid #334155; margin: 2rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.75rem; border: 1px solid #334155; text-align: left; }
    th { background: #1e293b; color: #a78bfa; }
    ul, ol { padding-left: 1.5rem; }
    li { margin: 0.5rem 0; }
    strong { color: #f8fafc; }
    code { background: #1e293b; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
    pre { background: #1e293b; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
${content.replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^---$/gm, '<hr>')
        .replace(/^\* (.+)$/gm, '<li>$1</li>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^\| (.+) \|$/gm, (match) => {
          const cells = match.split('|').filter(c => c.trim());
          return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
        })}
</body>
</html>`;
  };

  // Download handler
  const handleDownload = (format) => {
    let content, filename, mimeType;

    switch (format) {
      case 'markdown':
        content = generateFullReport();
        filename = `strategy-report-${new Date().toISOString().split('T')[0]}.md`;
        mimeType = 'text/markdown';
        break;
      case 'html':
        content = generateHtmlReport();
        filename = `strategy-report-${new Date().toISOString().split('T')[0]}.html`;
        mimeType = 'text/html';
        break;
      case 'text':
        content = generateFullReport()
          .replace(/^#+\s/gm, '')
          .replace(/\*\*/g, '')
          .replace(/---/g, '═'.repeat(50));
        filename = `strategy-report-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadStatus(`Downloaded ${filename}`);
    setTimeout(() => setDownloadStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold text-green-400">Strategy Complete!</h2>
        <p className="mt-2 text-slate-300">
          Your competitive response strategy and launch materials are ready.
        </p>
      </div>

      {/* Download buttons */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Download Report</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleDownload('markdown')}
            className="btn-secondary flex items-center gap-2"
          >
            📄 Download Markdown
          </button>
          <button
            onClick={() => handleDownload('html')}
            className="btn-secondary flex items-center gap-2"
          >
            🌐 Download HTML
          </button>
          <button
            onClick={() => handleDownload('text')}
            className="btn-secondary flex items-center gap-2"
          >
            📝 Download Text
          </button>
        </div>
        {downloadStatus && (
          <p className="mt-3 text-green-400 text-sm">{downloadStatus}</p>
        )}
      </div>

      {/* Launch materials preview */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">
          🚀 Launch Materials Preview
        </h3>
        <div className="markdown-content">
          <ReactMarkdown>{state.launchMaterials}</ReactMarkdown>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Original Threat</p>
          <p className="text-slate-300 text-sm mt-2 line-clamp-3">{state.threatText}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Competitor</p>
          <p className="text-slate-300 text-sm mt-2">
            {state.competitorKey
              ? state.competitorKey.replace('_', ' ').toUpperCase()
              : 'Unknown'}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Stakeholders Simulated</p>
          <p className="text-slate-300 text-sm mt-2">
            {Object.keys(state.stakeholderSimulations || {}).length} executives
          </p>
        </div>
      </div>

      {/* New Analysis button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={actions.reset}
          className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
        >
          🎯 Start New Analysis
        </button>
      </div>
    </div>
  );
}
