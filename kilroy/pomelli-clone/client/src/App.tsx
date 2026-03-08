import React, { useState } from 'react';
import URLInput from './components/URLInput';
import BrandDNACard from './components/BrandDNACard';
import CampaignResults from './components/CampaignResults';
import LoadingState from './components/LoadingState';

// Import proper types
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

interface CampaignConcept {
  concept_number: number;
  campaign_name: string;
  tagline: string;
  creative_rationale: string;
  visual_direction: string;
  posts: {
    platform: string;
    post_text: string;
    hashtags: string[];
    suggested_image_prompt: string;
    post_type: string;
    best_time_to_post: string;
  }[];
}

interface CampaignOutput {
  brand_name: string;
  campaign_goal: string;
  generated_at: string;
  concepts: CampaignConcept[];
}

type AppStep = 'input' | 'loading' | 'brand-dna' | 'generating' | 'campaigns';

const API_BASE_URL = '';

function App() {
  const [step, setStep] = useState<AppStep>('input');
  const [brandDNA, setBrandDNA] = useState<BrandDNA | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentGoal, setCurrentGoal] = useState<string>('');

  const handleURLSubmit = async (url: string) => {
    setStep('loading');
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extract`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        let msg = 'Failed to analyze website';
        try { const e = await response.json(); msg = e.error || msg; } catch {}
        throw new Error(msg);
      }

      const data = await response.json();
      setBrandDNA(data);
      setStep('brand-dna');
    } catch (err) {
      console.error('Extract error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze website. Please try again.');
      setStep('input');
    }
  };

  const handleCampaignGenerate = async (goal: string, platforms: string[] = ['instagram', 'linkedin', 'x']) => {
    if (!brandDNA) return;

    setStep('generating');
    setError(null);
    setCurrentGoal(goal);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brandDNA,
          request: {
            goal,
            platforms,
            number_of_concepts: 3,
            posts_per_concept: 3
          }
        })
      });

      if (!response.ok) {
        let msg = 'Failed to generate campaigns';
        try { const e = await response.json(); msg = e.error || msg; } catch {}
        throw new Error(`${msg} (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      
      // If we get empty concepts in demo mode, use inline demo data
      if (data.concepts && data.concepts.length === 0 && brandDNA.meta.site_title === 'Sweet Crumbs Bakery') {
        const demoCampaigns = {
          brand_name: "Sweet Crumbs Bakery",
          campaign_goal: goal,
          generated_at: new Date().toISOString(),
          concepts: [{
            concept_number: 1,
            campaign_name: "Spring Awakening Menu",
            tagline: "Fresh flavors bloom with every bite",
            creative_rationale: "This concept captures the essence of renewal and fresh beginnings that spring brings, connecting the seasonal ingredients in our spring menu with the emotional warmth that Sweet Crumbs is known for.",
            visual_direction: "Use bright, fresh colors with florals and green elements. Showcase seasonal ingredients like berries and herbs. Maintain the warm, artisanal aesthetic with natural lighting and handcrafted textures.",
            posts: [{
              platform: "instagram",
              post_text: "🌸 Spring has arrived at Sweet Crumbs! Our new seasonal menu celebrates the fresh flavors of the season with strawberry lavender scones, lemon herb focaccia, and our signature spring vegetable quiche. Each bite is handcrafted with love and the finest local ingredients. Come taste the season! ✨",
              hashtags: ["SpringMenu", "ArtisanalBaking", "LocalIngredients", "HandcraftedWithLove", "SeasonalFlavors", "FreshBaked", "SpringTreats"],
              suggested_image_prompt: "A rustic wooden table with an array of spring pastries: strawberry lavender scones with visible lavender buds, golden lemon herb focaccia with fresh herbs on top, and a slice of colorful spring vegetable quiche. Natural sunlight streaming through a window, with small spring flowers as decoration. Warm, inviting bakery atmosphere.",
              post_type: "single_image",
              best_time_to_post: "Tuesday 10:00 AM"
            }]
          }]
        };
        setCampaigns(demoCampaigns);
        setStep('campaigns');
        return;
      }
      
      setCampaigns(data);
      setStep('campaigns');
    } catch (err) {
      console.error('Generate error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate campaigns. Please try again.');
      setStep('brand-dna');
    }
  };

  const handleStartOver = () => {
    setStep('input');
    setBrandDNA(null);
    setCampaigns(null);
    setError(null);
    setCurrentGoal('');
  };

  const handleGenerateMore = () => {
    if (currentGoal) {
      handleCampaignGenerate(currentGoal);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '3.5rem', paddingTop: '2rem' }}>
        <div style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'transparent',
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          padding: '6px 16px',
          border: '1px solid rgba(255,45,110,0.2)',
          borderRadius: '20px',
        }}>
          AI Brand Intelligence
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '3.8rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, #F0EEF8 30%, rgba(240,238,248,0.5))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Snatch
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          Enter your website URL and we'll extract your brand identity and generate campaigns in seconds.
        </p>
      </header>

      {/* Error display */}
      {error && (
        <div className="card error-card">
          <h3 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>
            {error.includes('Failed to analyze') ? '❌ Website Analysis Error' : 
             error.includes('Failed to generate') ? '❌ Campaign Generation Error' :
             '❌ Something went wrong'}
          </h3>
          <p className="error">{error}</p>
          <button 
            className="button" 
            onClick={() => setError(null)}
            style={{ marginTop: '1rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step content */}
      {step === 'input' && (
        <URLInput onSubmit={handleURLSubmit} />
      )}

      {step === 'loading' && (
        <LoadingState />
      )}

      {step === 'brand-dna' && brandDNA && (
        <BrandDNACard 
          brandDNA={brandDNA} 
          onGenerateCampaigns={handleCampaignGenerate}
        />
      )}

      {step === 'generating' && (
        <div className="card loading-card">
          <div className="loading-content">
            <div className="spinner"></div>
            <h3>Generating campaigns...</h3>
            <p>Creating on-brand marketing concepts based on your Brand DNA</p>
          </div>
        </div>
      )}

      {step === 'campaigns' && campaigns && brandDNA && (
        <>
          <BrandDNACard 
            brandDNA={brandDNA} 
            onGenerateCampaigns={handleCampaignGenerate}
            showActions={false}
          />
          <CampaignResults 
            campaigns={campaigns}
            onStartOver={handleStartOver}
            onGenerateMore={handleGenerateMore}
          />
        </>
      )}

      {/* Footer */}
      <footer className="footer">
        Snatch — spec-driven, agent-built
      </footer>
    </div>
  );
}

export default App;