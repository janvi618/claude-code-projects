import React, { useState, useEffect } from 'react';

interface SocialPost {
  platform: string;
  post_text: string;
  hashtags: string[];
  suggested_image_prompt: string;
  post_type: string;
  best_time_to_post: string;
}

interface PostCardProps {
  post: SocialPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!post.suggested_image_prompt) {
      setImageLoading(false);
      return;
    }
    setImageLoading(true);
    setImageFailed(false);
    fetch(`/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: post.suggested_image_prompt }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.image?.url) {
          setImageUrl(data.image.url);
        } else {
          setImageFailed(true);
        }
      })
      .catch(() => setImageFailed(true))
      .finally(() => setImageLoading(false));
  }, [post.suggested_image_prompt]);

  const handleCopy = async () => {
    const textToCopy = `${post.post_text}\n\n${post.hashtags.map(tag => `#${tag}`).join(' ')}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPlatformIcon = (platform: string): string => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'linkedin': return '💼';
      case 'x': return '🐦';
      case 'facebook': return '👥';
      case 'tiktok': return '🎵';
      default: return '📱';
    }
  };

  const getPostTypeColor = (postType: string): string => {
    switch (postType.toLowerCase()) {
      case 'carousel': return '#FF6B6B';
      case 'single_image': return '#4ECDC4';
      case 'video_concept': return '#45B7D1';
      case 'text_only': return '#96CEB4';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{
      border: '1px solid #E5E7EB',
      borderRadius: 'var(--border-radius-input)',
      padding: '1.5rem',
      backgroundColor: 'var(--card-bg)',
      position: 'relative',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '20px' }}>{getPlatformIcon(post.platform)}</span>
          <span style={{ 
            textTransform: 'capitalize',
            fontWeight: 'bold',
            fontSize: '15px',
            color: 'var(--text-primary)'
          }}>
            {post.platform === 'x' ? 'X' : post.platform}
          </span>
        </div>
        
        <span style={{
          backgroundColor: getPostTypeColor(post.post_type),
          color: 'white',
          padding: '4px 10px',
          borderRadius: '14px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {post.post_type.replace('_', ' ')}
        </span>
      </div>

      {/* Post text */}
      <div style={{
        backgroundColor: 'var(--bg-color)',
        padding: '1.2rem',
        borderRadius: '10px',
        marginBottom: '1.2rem',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.6',
        fontSize: '15px',
        border: '1px solid #F3F4F6'
      }}>
        {post.post_text}
      </div>

      {/* Hashtags */}
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0.7rem', fontWeight: '600' }}>
          Hashtags:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {post.hashtags.map((hashtag, index) => (
            <span
              key={index}
              style={{
                backgroundColor: '#E5E7EB',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              #{hashtag}
            </span>
          ))}
        </div>
      </div>

      {/* Generated image */}
      <div style={{ marginBottom: '1.2rem' }}>
        {imageLoading && (
          <div style={{
            height: '180px',
            backgroundColor: '#F3F4F6',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            gap: '8px'
          }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
            Generating image...
          </div>
        )}
        {!imageLoading && imageUrl && (
          <img
            src={imageUrl}
            alt="Campaign visual"
            style={{
              width: '100%',
              borderRadius: '10px',
              display: 'block',
              objectFit: 'cover',
              maxHeight: '300px'
            }}
          />
        )}
        {!imageLoading && imageFailed && (
          <div style={{
            height: '80px',
            backgroundColor: '#FEF2F2',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            color: '#EF4444'
          }}>
            Image unavailable
          </div>
        )}
      </div>

      {/* Best time to post */}
      <div style={{ 
        fontSize: '13px', 
        color: 'var(--text-secondary)',
        marginBottom: '1.2rem',
        padding: '0.7rem',
        backgroundColor: '#F8FAFC',
        borderRadius: '8px',
        border: '1px solid #F1F5F9'
      }}>
        <strong>Best time:</strong> {post.best_time_to_post}
      </div>

      {/* Copy button */}
      <button
        className="button"
        onClick={handleCopy}
        style={{
          width: '100%',
          backgroundColor: copied ? 'var(--secondary-accent)' : 'var(--primary-accent)',
          fontSize: '14px',
          padding: '12px 16px',
          fontWeight: '600',
          transition: 'all 0.2s ease'
        }}
      >
        {copied ? '✓ Copied!' : 'Copy Post'}
      </button>
    </div>
  );
};

export default PostCard;