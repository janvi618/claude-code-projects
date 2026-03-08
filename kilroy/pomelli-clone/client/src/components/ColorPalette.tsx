import React from 'react';

interface ColorPaletteProps {
  colors: {
    primary: string[];
    secondary: string[];
    background: string;
    text: string;
    accent: string | null;
  };
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  const ColorSwatch: React.FC<{ color: string; size: 'large' | 'small'; label?: string }> = ({ 
    color, 
    size, 
    label 
  }) => {
    const swatchSize = size === 'large' ? 60 : 40;
    
    return (
      <div style={{ textAlign: 'center', margin: '8px' }}>
        <div
          style={{
            width: swatchSize,
            height: swatchSize,
            backgroundColor: color,
            borderRadius: '50%',
            border: '2px solid #E5E7EB',
            margin: '0 auto 8px auto',
            position: 'relative',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {label && (
            <span
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: 'var(--secondary-accent)',
                color: 'white',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}
            >
              {label}
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
          {color.toUpperCase()}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end' }}>
        {/* Primary colors (large swatches) */}
        {colors.primary.map((color, index) => (
          <ColorSwatch key={`primary-${index}`} color={color} size="large" />
        ))}
        
        {/* Accent color with special label */}
        {colors.accent && (
          <ColorSwatch color={colors.accent} size="large" label="CTA" />
        )}
        
        {/* Secondary colors (smaller swatches) */}
        {colors.secondary.map((color, index) => (
          <ColorSwatch key={`secondary-${index}`} color={color} size="small" />
        ))}
      </div>
      
      {/* Background and text colors as a separate row */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: 'var(--card-bg)', 
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Background
          </div>
          <ColorSwatch color={colors.background} size="small" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Text
          </div>
          <ColorSwatch color={colors.text} size="small" />
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;