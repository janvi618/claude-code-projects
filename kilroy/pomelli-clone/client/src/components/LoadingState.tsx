import React, { useState, useEffect } from 'react';

const loadingPhases = [
  'Fetching website...',
  'Analyzing visual identity...',
  'Understanding brand voice...',
  'Building Brand DNA profile...'
];

const LoadingState: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % loadingPhases.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        {/* Spinner */}
        <div 
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid var(--text-secondary)',
            borderTop: '4px solid var(--primary-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 2rem auto'
          }}
        />
        
        <h3 style={{ marginBottom: '1rem' }}>Analyzing your brand...</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
          {loadingPhases[currentPhase]}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;