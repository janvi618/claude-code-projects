/**
 * Utility functions for Brand DNA extraction
 */

/**
 * Normalize a URL by adding protocol if missing and removing trailing slash
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  
  // Add protocol if missing
  if (!normalized.match(/^https?:\/\//)) {
    normalized = `https://${normalized}`;
  }
  
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  
  return normalized;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert various color formats to hex
 */
export function colorToHex(color: string): string | null {
  color = color.trim().toLowerCase();
  
  // Already hex
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color.toUpperCase();
  }
  
  // Short hex
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }
  
  // RGB/RGBA
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }
  
  // HSL/HSLA - simplified conversion (just for common cases)
  const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360;
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;
    
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const rInt = Math.round(r * 255);
    const gInt = Math.round(g * 255);
    const bInt = Math.round(b * 255);
    
    return '#' + ((1 << 24) + (rInt << 16) + (gInt << 8) + bInt).toString(16).slice(1).toUpperCase();
  }
  
  // Named colors (common ones)
  const namedColors: Record<string, string> = {
    'white': '#FFFFFF',
    'black': '#000000',
    'red': '#FF0000',
    'green': '#008000',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'silver': '#C0C0C0',
    'gray': '#808080',
    'grey': '#808080',
    'maroon': '#800000',
    'olive': '#808000',
    'lime': '#00FF00',
    'aqua': '#00FFFF',
    'teal': '#008080',
    'navy': '#000080',
    'fuchsia': '#FF00FF',
    'purple': '#800080'
  };
  
  if (namedColors[color]) {
    return namedColors[color];
  }
  
  return null;
}

/**
 * Classify font style based on font family names
 */
export function classifyFontStyle(fontFamilies: string[]): string {
  const fonts = fontFamilies.map(f => f.toLowerCase());
  
  // Monospace/technical
  const technicalFonts = ['courier', 'monaco', 'menlo', 'consolas', 'fira code', 'jetbrains mono', 'source code pro'];
  if (fonts.some(font => technicalFonts.some(tech => font.includes(tech)) || font.includes('mono'))) {
    return 'technical';
  }
  
  // Playful
  const playfulFonts = ['comic sans', 'pacifico', 'lobster', 'dancing script', 'kalam', 'indie flower'];
  if (fonts.some(font => playfulFonts.some(playful => font.includes(playful)))) {
    return 'playful';
  }
  
  // Elegant
  const elegantFonts = ['playfair', 'lora', 'montserrat thin', 'montserrat light', 'cormorant', 'crimson text'];
  if (fonts.some(font => elegantFonts.some(elegant => font.includes(elegant)) || font.includes('thin') || font.includes('light'))) {
    return 'elegant';
  }
  
  // Classic/serif
  const serifFonts = ['times', 'georgia', 'garamond', 'baskerville', 'palatino', 'book antiqua'];
  if (fonts.some(font => serifFonts.some(serif => font.includes(serif)) || font.includes('serif'))) {
    return 'classic';
  }
  
  // Minimal/geometric
  const minimalFonts = ['futura', 'avenir', 'dm sans', 'work sans', 'poppins', 'nunito'];
  if (fonts.some(font => minimalFonts.some(minimal => font.includes(minimal)))) {
    return 'minimal';
  }
  
  // Default to modern for common sans-serif fonts
  return 'modern';
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Check if a URL is likely an internal link
 */
export function isInternalLink(link: string, baseUrl: string): boolean {
  try {
    const linkUrl = new URL(link, baseUrl);
    const baseUrlObj = new URL(baseUrl);
    return linkUrl.hostname === baseUrlObj.hostname;
  } catch {
    return false;
  }
}

/**
 * Check if URL contains social media patterns
 */
export function isSocialMediaUrl(url: string): boolean {
  const socialDomains = [
    'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 
    'youtube.com', 'tiktok.com', 'pinterest.com', 'snapchat.com',
    'github.com', 'discord.com', 'telegram.org', 'whatsapp.com'
  ];
  
  return socialDomains.some(domain => url.includes(domain));
}

/**
 * Simple text cleanup - remove extra whitespace and normalize
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}