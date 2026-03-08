import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';

interface CampaignOutput {
  brand_name: string;
  campaign_goal: string;
  generated_at: string;
  concepts: CampaignConcept[];
}

interface CampaignConcept {
  concept_number: number;
  campaign_name: string;
  tagline: string;
  creative_rationale: string;
  visual_direction: string;
  posts: SocialPost[];
  hero_image?: { url: string; prompt: string } | null;
}

interface SocialPost {
  platform: string;
  post_text: string;
  hashtags: string[];
  suggested_image_prompt: string;
  post_type: string;
  best_time_to_post: string;
}

interface CampaignResultsProps {
  campaigns: CampaignOutput;
  onStartOver: () => void;
  onGenerateMore: () => void;
}

const CampaignResults: React.FC<CampaignResultsProps> = ({
  campaigns,
  onStartOver,
  onGenerateMore
}) => {
  const [conceptImages, setConceptImages] = useState<Record<number, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Fetch images for each concept in parallel after campaigns render
    campaigns.concepts.forEach((concept) => {
      // Skip if already has image or already loading
      if (concept.hero_image || conceptImages[concept.concept_number] || loadingImages[concept.concept_number]) return;

      const prompt = concept.visual_direction || concept.posts[0]?.suggested_image_prompt;
      if (!prompt) return;

      setLoadingImages(prev => ({ ...prev, [concept.concept_number]: true }));

      fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
        .then(res => res.json())
        .then(data => {
          if (data.image?.url) {
            setConceptImages(prev => ({ ...prev, [concept.concept_number]: data.image.url }));
          }
        })
        .catch(err => console.error('Image fetch failed:', err))
        .finally(() => {
          setLoadingImages(prev => ({ ...prev, [concept.concept_number]: false }));
        });
    });
  }, [campaigns.concepts]);

  if (!campaigns.concepts || campaigns.concepts.length === 0) {
    return (
      <div className="card no-campaigns">
        <h3>No campaigns generated</h3>
        <p>There was an issue generating campaigns. Please try again.</p>
        <button className="button" onClick={onStartOver}>
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="campaign-results">
      <div className="results-header">
        <h2>Your Campaign Concepts</h2>
        <div className="campaign-meta">
          <p><strong>Goal:</strong> {campaigns.campaign_goal}</p>
          <p><strong>Brand:</strong> {campaigns.brand_name}</p>
        </div>
      </div>

      {campaigns.concepts.map((concept) => (
        <div key={concept.concept_number} className="campaign-concept-card">
          {/* Hero image */}
          {(conceptImages[concept.concept_number] || loadingImages[concept.concept_number]) && (
            <div style={{
              marginBottom: '1.5rem',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              backgroundColor: '#F3F4F6',
              minHeight: loadingImages[concept.concept_number] ? '200px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {loadingImages[concept.concept_number] ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                  <p>Generating campaign visual...</p>
                </div>
              ) : (
                <img
                  src={conceptImages[concept.concept_number]}
                  alt={`Campaign visual for ${concept.campaign_name}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              )}
            </div>
          )}

          {/* Campaign header */}
          <div className="concept-header">
            <h3 className="campaign-name">{concept.campaign_name}</h3>
            <p className="tagline">"{concept.tagline}"</p>
            
            {/* Creative rationale */}
            <div className="rationale-box">
              <h4>Creative Rationale</h4>
              <p>{concept.creative_rationale}</p>
            </div>

            {/* Visual direction */}
            <div className="visual-direction-box">
              <h4>Visual Direction</h4>
              <p>{concept.visual_direction}</p>
            </div>
          </div>

          {/* Posts organized by platform */}
          <div className="posts-section">
            <h4>Social Media Posts</h4>
            {['instagram', 'linkedin', 'x'].map((platform) => {
              const platformPosts = concept.posts.filter(post => post.platform === platform);
              
              if (platformPosts.length === 0) return null;

              return (
                <div key={platform} className="platform-section">
                  <h5 className="platform-name">
                    {platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </h5>
                  
                  <div className="posts-grid">
                    {platformPosts.map((post, index) => (
                      <PostCard key={`${platform}-${index}`} post={post} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Action buttons */}
      <div className="actions-card">
        <div className="action-buttons">
          <button 
            className="button secondary-button"
            onClick={onGenerateMore}
          >
            Generate More
          </button>
          <button 
            className="button tertiary-button"
            onClick={onStartOver}
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignResults;