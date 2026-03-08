import React, { useState } from 'react';
import ColorPalette from './ColorPalette';
import VoiceProfile from './VoiceProfile';

interface BrandDNA {
  url: string;
  extracted_at: string;
  confidence: number;
  colors: {
    primary: string[];
    secondary: string[];
    background: string;
    text: string;
    accent: string | null;
  };
  typography: {
    heading_fonts: string[];
    body_fonts: string[];
    font_style: string;
  };
  imagery: {
    has_hero_image: boolean;
    image_count: number;
    image_themes: string[];
    uses_illustrations: boolean;
    dominant_image_mood: string;
  };
  voice: {
    tone_descriptors: string[];
    formality: string;
    sentence_style: string;
    uses_humor: boolean;
    uses_jargon: boolean;
    perspective: string;
  };
  positioning: {
    industry_guess: string;
    target_audience_guess: string;
    value_proposition: string;
    key_messages: string[];
    differentiators: string[];
  };
  meta: {
    site_title: string;
    meta_description: string | null;
    pages_analyzed: number;
    total_text_length: number;
    has_blog: boolean;
    has_ecommerce: boolean;
    social_links: string[];
    error?: string;
  };
}

interface BrandDNACardProps {
  brandDNA: BrandDNA;
  onGenerateCampaigns: (goal: string, platforms?: string[]) => void;
  showActions?: boolean;
}

const BrandDNACard: React.FC<BrandDNACardProps> = ({ 
  brandDNA, 
  onGenerateCampaigns, 
  showActions = true 
}) => {
  const [campaignGoal, setCampaignGoal] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'linkedin', 'x']);

  const getConfidenceBadge = (confidence: number) => {
    if (confidence > 0.7) {
      return { text: 'High confidence', color: 'var(--secondary-accent)' };
    } else if (confidence > 0.4) {
      return { text: 'Medium confidence', color: '#F59E0B' };
    } else {
      return { text: 'Low confidence', color: 'var(--error-color)' };
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleGenerateCampaigns = () => {
    if (campaignGoal.trim() && selectedPlatforms.length > 0) {
      onGenerateCampaigns(campaignGoal.trim(), selectedPlatforms);
    }
  };

  const badge = getConfidenceBadge(brandDNA.confidence);

  return (
    <div className="card brand-dna-card">
      {/* Header section */}
      <div className="header-section">
        <h2 className="site-title">{brandDNA.meta.site_title}</h2>
        <p className="site-url">{brandDNA.url}</p>
        <span className="confidence-badge" style={{ backgroundColor: badge.color }}>
          {badge.text}
        </span>
      </div>

      {/* Color palette section */}
      <div className="section">
        <h3>Your Brand Colors</h3>
        <ColorPalette colors={brandDNA.colors} />
      </div>

      {/* Typography section */}
      <div className="section">
        <h3>Your Typography</h3>
        <div className="content-box">
          <p><strong>Heading fonts:</strong> {brandDNA.typography.heading_fonts.join(', ') || 'Not detected'}</p>
          <p><strong>Body fonts:</strong> {brandDNA.typography.body_fonts.join(', ') || 'Not detected'}</p>
          <span className="tag">
            {brandDNA.typography.font_style}
          </span>
        </div>
      </div>

      {/* Voice section */}
      <div className="section">
        <h3>Your Brand Voice</h3>
        <VoiceProfile voice={brandDNA.voice} />
      </div>

      {/* Positioning section */}
      <div className="section">
        <h3>Your Market Position</h3>
        <div className="content-box">
          <p><strong>Industry:</strong> {brandDNA.positioning.industry_guess}</p>
          <p><strong>Target Audience:</strong> {brandDNA.positioning.target_audience_guess}</p>
          
          <div className="value-proposition">
            {brandDNA.positioning.value_proposition}
          </div>

          {brandDNA.positioning.key_messages.length > 0 && (
            <div>
              <strong>Key Messages:</strong>
              <ul>
                {brandDNA.positioning.key_messages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {brandDNA.positioning.differentiators.length > 0 && (
            <div>
              <strong>Differentiators:</strong>
              <ul>
                {brandDNA.positioning.differentiators.map((diff, index) => (
                  <li key={index}>{diff}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action section */}
      {showActions && (
        <div className="action-section">
          <h3>Generate Campaigns</h3>
          <div className="goal-input">
            <input
              type="text"
              className="input"
              placeholder="e.g., Promote our spring sale, Launch new product, Grow social following"
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
            />
          </div>
          
          <div className="platform-checkboxes">
            {['instagram', 'linkedin', 'x'].map(platform => (
              <label key={platform} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedPlatforms.includes(platform)}
                  onChange={() => handlePlatformToggle(platform)}
                />
                {platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1)}
              </label>
            ))}
          </div>
          
          <button 
            className="button primary-button"
            onClick={handleGenerateCampaigns}
            disabled={!campaignGoal.trim() || selectedPlatforms.length === 0}
          >
            Generate Campaigns
          </button>
        </div>
      )}
    </div>
  );
};

export default BrandDNACard;