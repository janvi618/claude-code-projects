import React from 'react';

interface VoiceProfileProps {
  voice: {
    tone_descriptors: string[];
    formality: string;
    sentence_style: string;
    uses_humor: boolean;
    uses_jargon: boolean;
    perspective: string;
  };
}

const VoiceProfile: React.FC<VoiceProfileProps> = ({ voice }) => {
  const getFormalityPosition = (formality: string): number => {
    const levels = ['very_formal', 'formal', 'neutral', 'casual', 'very_casual'];
    const index = levels.indexOf(formality);
    return index >= 0 ? index : 2; // Default to neutral if not found
  };

  const getPerspectiveDescription = (perspective: string): string => {
    switch (perspective) {
      case 'first_person_plural':
        return "You speak in first person plural ('we')";
      case 'third_person':
        return "You speak in third person";
      case 'second_person':
        return "You speak directly to your audience ('you')";
      case 'mixed':
        return "You use a mix of perspectives";
      default:
        return "Perspective not detected";
    }
  };

  const getSentenceStyleDescription = (style: string): string => {
    switch (style) {
      case 'short_punchy':
        return 'Short, punchy sentences';
      case 'medium_balanced':
        return 'Medium, balanced sentences';
      case 'long_detailed':
        return 'Long, detailed sentences';
      default:
        return style;
    }
  };

  const formalityPosition = getFormalityPosition(voice.formality);
  const formalityPercentage = (formalityPosition / 4) * 100;

  return (
    <div className="voice-profile">
      {/* Tone descriptors as pills */}
      <div className="tone-section">
        <div className="section-label">Tone:</div>
        <div className="tone-pills">
          {voice.tone_descriptors.map((descriptor, index) => (
            <span key={index} className="tone-pill">
              {descriptor}
            </span>
          ))}
        </div>
      </div>

      {/* Formality scale */}
      <div className="formality-section">
        <div className="section-label">Formality Level:</div>
        <div className="formality-scale">
          <div className="scale-background">
            <div 
              className="scale-indicator"
              style={{ left: `${formalityPercentage}%` }}
            />
          </div>
          <div className="scale-labels">
            <span>Very Formal</span>
            <span>Formal</span>
            <span>Neutral</span>
            <span>Casual</span>
            <span>Very Casual</span>
          </div>
        </div>
      </div>

      {/* Additional voice characteristics */}
      <div className="voice-characteristics">
        <div className="characteristic-row">
          <strong>Sentence Style:</strong> {getSentenceStyleDescription(voice.sentence_style)}
        </div>
        <div className="characteristic-row">
          <strong>Uses Humor:</strong> {voice.uses_humor ? 'Yes' : 'No'}
        </div>
        <div className="characteristic-row">
          <strong>Uses Jargon:</strong> {voice.uses_jargon ? 'Yes' : 'No'}
        </div>
      </div>

      {/* Perspective */}
      <div className="perspective-section">
        <div className="section-label">Voice Perspective:</div>
        <div className="perspective-description">
          {getPerspectiveDescription(voice.perspective)}
        </div>
      </div>
    </div>
  );
};

export default VoiceProfile;