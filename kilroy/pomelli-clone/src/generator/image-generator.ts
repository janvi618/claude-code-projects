import OpenAI from 'openai';

function getClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

/**
 * Generate a campaign hero image using DALL-E
 */
export async function generateImage(prompt: string): Promise<GeneratedImage | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, skipping image generation');
    return null;
  }

  try {
    const response = await getClient().images.generate({
      model: 'gpt-image-1',
      prompt: `Marketing campaign visual: ${prompt}. Style: professional social media marketing image, high quality, vibrant.`,
      n: 1,
      size: '1024x1024',
      quality: 'medium',
    });

    const b64 = response.data[0]?.b64_json;
    if (!b64) return null;

    return { url: `data:image/png;base64,${b64}`, prompt };
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
}

/**
 * Generate hero images for each campaign concept in parallel
 */
export async function generateConceptImages(
  concepts: Array<{ visual_direction: string; posts: Array<{ suggested_image_prompt: string }> }>
): Promise<(GeneratedImage | null)[]> {
  const imagePromises = concepts.map((concept) => {
    // Use visual_direction as the primary prompt, fall back to first post's image prompt
    const prompt = concept.visual_direction || concept.posts[0]?.suggested_image_prompt || '';
    if (!prompt) return Promise.resolve(null);
    return generateImage(prompt);
  });

  return Promise.all(imagePromises);
}
