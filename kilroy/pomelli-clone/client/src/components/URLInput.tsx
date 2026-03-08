import React, { useState } from 'react';

interface URLInputProps {
  onSubmit: (url: string) => void;
}

const URLInput: React.FC<URLInputProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const validateURL = (input: string): boolean => {
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    let processedURL = url.trim();
    
    // Add https:// if no protocol is provided
    if (!processedURL.match(/^https?:\/\//i)) {
      processedURL = `https://${processedURL}`;
    }

    if (!validateURL(processedURL)) {
      setError('Please enter a valid URL including https://');
      return;
    }

    onSubmit(processedURL);
  };

  return (
    <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            className="input"
            placeholder={isDemoMode 
              ? "Try: sweetcrumbsbakery.com, acmelaw.com, novatech.io"
              : "Enter your website URL (e.g., https://example.com)"
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ fontSize: '18px', padding: '16px 20px' }}
          />
        </div>
        
        {error && <p className="error">{error}</p>}
        
        <button 
          type="submit" 
          className="button"
          style={{ fontSize: '18px', padding: '16px 32px', marginTop: '1rem' }}
        >
          Analyze
        </button>
      </form>
      
      {/* Demo mode suggestions - only show when demo mode is enabled */}
      {isDemoMode && (
        <div style={{ marginTop: '2rem', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p><strong>Demo Mode:</strong> Try these sample URLs for instant results</p>
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
              sweetcrumbsbakery.com • acmelaw.com • novatech.io
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default URLInput;