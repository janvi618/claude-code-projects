/**
 * Phase 2: Visual Analysis
 * Deterministic extraction of colors, typography, and imagery from CSS/HTML
 */

import * as cheerio from 'cheerio';
import * as css from 'css';
import { colorToHex, classifyFontStyle } from './utils.js';

export interface VisualAnalysis {
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
    image_themes: string[]; // Will be placeholder until AI analysis
    uses_illustrations: boolean;
    dominant_image_mood: string; // Will be placeholder until AI analysis
  };
}

export function analyzeVisuals(
  html: string, 
  cssText: string, 
  images: string[]
): VisualAnalysis {
  const $ = cheerio.load(html);
  
  // Extract colors from CSS and HTML
  const colors = extractColors(cssText, $);
  
  // Extract typography information
  const typography = extractTypography(cssText);
  
  // Analyze imagery
  const imagery = analyzeImagery(images, $);
  
  return {
    colors,
    typography,
    imagery
  };
}

function extractColors(cssText: string, $: cheerio.CheerioAPI): {
  primary: string[];
  secondary: string[];
  background: string;
  text: string;
  accent: string | null;
} {
  const colorFrequency: Map<string, number> = new Map();
  const backgroundColors: string[] = [];
  const textColors: string[] = [];
  const accentColors: string[] = [];
  
  // Parse CSS and extract colors
  try {
    const parsed = css.parse(cssText);
    extractColorsFromAST(parsed, colorFrequency, backgroundColors, textColors, accentColors);
  } catch (error) {
    console.warn('CSS parsing failed, using fallback extraction');
  }
  
  // Also extract from inline styles
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || '';
    extractColorsFromInlineStyle(style, colorFrequency, backgroundColors, textColors, accentColors, $(el));
  });
  
  // Process collected colors
  const validColors: Array<{hex: string; count: number}> = [];
  
  for (const [color, count] of colorFrequency.entries()) {
    const hex = colorToHex(color);
    if (hex && hex !== '#FFFFFF' && hex !== '#000000') {
      validColors.push({ hex, count });
    }
  }
  
  // Sort by frequency
  validColors.sort((a, b) => b.count - a.count);
  
  // Extract primary and secondary colors
  const primary = validColors.slice(0, 3).map(c => c.hex);
  const secondary = validColors.slice(3, 8).map(c => c.hex);
  
  // Determine background color
  const backgroundHex = findMostCommonColor(backgroundColors) || '#FFFFFF';
  
  // Determine text color
  const textHex = findMostCommonColor(textColors) || '#000000';
  
  // Determine accent color
  const accentHex = findMostCommonColor(accentColors);
  
  return {
    primary,
    secondary,
    background: backgroundHex,
    text: textHex,
    accent: accentHex
  };
}

function extractColorsFromAST(
  ast: any, 
  colorFrequency: Map<string, number>,
  backgroundColors: string[],
  textColors: string[],
  accentColors: string[]
): void {
  if (!ast.stylesheet || !ast.stylesheet.rules) return;
  
  for (const rule of ast.stylesheet.rules) {
    if (rule.type === 'rule' && rule.declarations) {
      const selector = rule.selectors?.join(' ') || '';
      
      for (const declaration of rule.declarations) {
        if (declaration.type === 'declaration') {
          const property = declaration.property;
          const value = declaration.value;
          
          if (isColorProperty(property)) {
            const colors = extractColorsFromValue(value);
            
            for (const color of colors) {
              // Increment frequency count
              colorFrequency.set(color, (colorFrequency.get(color) || 0) + 1);
              
              // Categorize by property and selector
              if (property.includes('background')) {
                if (selector.includes('body') || selector.includes('main') || selector.includes('html')) {
                  backgroundColors.push(color);
                }
              } else if (property === 'color') {
                if (selector.includes('p') || selector.includes('text') || selector.includes('body')) {
                  textColors.push(color);
                }
              }
              
              if (selector.includes('button') || selector.includes('btn') || selector.includes('cta') || 
                  selector.includes('a:') || selector.includes('link')) {
                accentColors.push(color);
              }
            }
          }
        }
      }
    }
  }
}

function extractColorsFromInlineStyle(
  style: string,
  colorFrequency: Map<string, number>,
  backgroundColors: string[],
  textColors: string[],
  accentColors: string[],
  $el: cheerio.Cheerio<cheerio.Element>
): void {
  const properties = style.split(';');
  const tagName = $el.prop('tagName')?.toLowerCase() || '';
  const className = $el.attr('class') || '';
  
  for (const prop of properties) {
    const [property, value] = prop.split(':').map(s => s.trim());
    
    if (isColorProperty(property)) {
      const colors = extractColorsFromValue(value);
      
      for (const color of colors) {
        colorFrequency.set(color, (colorFrequency.get(color) || 0) + 1);
        
        if (property.includes('background')) {
          backgroundColors.push(color);
        } else if (property === 'color') {
          textColors.push(color);
        }
        
        if (tagName === 'button' || className.includes('btn') || className.includes('cta')) {
          accentColors.push(color);
        }
      }
    }
  }
}

function isColorProperty(property: string): boolean {
  const colorProperties = [
    'color', 'background-color', 'background', 'border-color', 
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'fill', 'stroke'
  ];
  return colorProperties.includes(property);
}

function extractColorsFromValue(value: string): string[] {
  const colors: string[] = [];
  
  // Match various color formats
  const colorPatterns = [
    /#[0-9a-f]{6}|#[0-9a-f]{3}/gi,  // Hex
    /rgb\([^)]+\)/gi,                // RGB
    /rgba\([^)]+\)/gi,               // RGBA
    /hsl\([^)]+\)/gi,                // HSL
    /hsla\([^)]+\)/gi,               // HSLA
  ];
  
  for (const pattern of colorPatterns) {
    const matches = value.match(pattern);
    if (matches) {
      colors.push(...matches);
    }
  }
  
  // Named colors (simple check for common ones)
  const namedColorPattern = /\b(white|black|red|green|blue|yellow|purple|orange|pink|gray|grey|brown)\b/gi;
  const namedMatches = value.match(namedColorPattern);
  if (namedMatches) {
    colors.push(...namedMatches);
  }
  
  return colors;
}

function findMostCommonColor(colors: string[]): string | null {
  if (colors.length === 0) return null;
  
  const frequency: Map<string, number> = new Map();
  
  for (const color of colors) {
    const hex = colorToHex(color);
    if (hex) {
      frequency.set(hex, (frequency.get(hex) || 0) + 1);
    }
  }
  
  let mostCommon = null;
  let maxCount = 0;
  
  for (const [hex, count] of frequency.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = hex;
    }
  }
  
  return mostCommon;
}

function extractTypography(cssText: string): {
  heading_fonts: string[];
  body_fonts: string[];
  font_style: string;
} {
  const headingFonts: Set<string> = new Set();
  const bodyFonts: Set<string> = new Set();
  const allFonts: string[] = [];
  
  try {
    const parsed = css.parse(cssText);
    extractFontsFromAST(parsed, headingFonts, bodyFonts, allFonts);
  } catch (error) {
    console.warn('CSS parsing failed for typography extraction');
  }
  
  // Also extract from common default fonts if no fonts found
  if (headingFonts.size === 0 && bodyFonts.size === 0) {
    bodyFonts.add('Arial');
    headingFonts.add('Arial');
    allFonts.push('Arial');
  }
  
  const fontStyle = classifyFontStyle(allFonts);
  
  return {
    heading_fonts: Array.from(headingFonts),
    body_fonts: Array.from(bodyFonts),
    font_style: fontStyle
  };
}

function extractFontsFromAST(
  ast: any, 
  headingFonts: Set<string>,
  bodyFonts: Set<string>,
  allFonts: string[]
): void {
  if (!ast.stylesheet || !ast.stylesheet.rules) return;
  
  for (const rule of ast.stylesheet.rules) {
    if (rule.type === 'rule' && rule.declarations) {
      const selectors = rule.selectors || [];
      
      for (const declaration of rule.declarations) {
        if (declaration.type === 'declaration' && declaration.property === 'font-family') {
          const fontFamily = parseFontFamily(declaration.value);
          allFonts.push(...fontFamily);
          
          // Categorize by selector
          const isHeading = selectors.some((sel: string) => 
            /h[1-6]|heading|title/i.test(sel)
          );
          const isBody = selectors.some((sel: string) => 
            /body|p|text|main|article/i.test(sel)
          );
          
          if (isHeading) {
            fontFamily.forEach(font => headingFonts.add(font));
          } else if (isBody) {
            fontFamily.forEach(font => bodyFonts.add(font));
          } else {
            // Default to body fonts
            fontFamily.forEach(font => bodyFonts.add(font));
          }
        }
      }
    }
  }
}

function parseFontFamily(value: string): string[] {
  // Remove quotes and split by comma
  return value
    .split(',')
    .map(font => font.trim().replace(/['"]/g, ''))
    .filter(font => font && !font.match(/^(serif|sans-serif|monospace|cursive|fantasy)$/i));
}

function analyzeImagery(images: string[], $: cheerio.CheerioAPI): {
  has_hero_image: boolean;
  image_count: number;
  image_themes: string[];
  uses_illustrations: boolean;
  dominant_image_mood: string;
} {
  const image_count = images.length;
  
  // Check for hero image (large image near top of page)
  const has_hero_image = checkForHeroImage($);
  
  // Check if uses illustrations vs photos
  const uses_illustrations = checkUsesIllustrations(images);
  
  return {
    has_hero_image,
    image_count,
    image_themes: [], // Placeholder - would be filled by AI analysis
    uses_illustrations,
    dominant_image_mood: 'neutral' // Placeholder - would be filled by AI analysis
  };
}

function checkForHeroImage($: cheerio.CheerioAPI): boolean {
  // Look for large images in common hero positions
  const heroSelectors = [
    'img[src]:first-child',
    '.hero img',
    '.banner img',
    'header img',
    '.cover img',
    '.jumbotron img'
  ];
  
  for (const selector of heroSelectors) {
    if ($(selector).length > 0) {
      return true;
    }
  }
  
  // Check for background images on hero-like containers
  const heroContainers = $('.hero, .banner, .cover, .jumbotron, header');
  for (let i = 0; i < heroContainers.length; i++) {
    const style = $(heroContainers[i]).attr('style') || '';
    if (style.includes('background-image')) {
      return true;
    }
  }
  
  return false;
}

function checkUsesIllustrations(images: string[]): boolean {
  if (images.length === 0) return false;
  
  let illustrationCount = 0;
  
  for (const image of images) {
    const url = image.toLowerCase();
    if (url.includes('svg') || 
        url.includes('illustration') || 
        url.includes('icon') || 
        url.includes('vector') ||
        url.endsWith('.svg')) {
      illustrationCount++;
    }
  }
  
  // If more than half are illustrations, return true
  return illustrationCount > (images.length / 2);
}