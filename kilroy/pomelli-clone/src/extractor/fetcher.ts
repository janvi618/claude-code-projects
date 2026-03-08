/**
 * Phase 1: Fetch & Parse
 * Handles URL fetching, HTML parsing, and content extraction
 */

import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';
import { ExtractorOptions } from './types.js';
import { normalizeUrl, isValidUrl, isInternalLink, isSocialMediaUrl, cleanText } from './utils.js';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface ExtractedContent {
  html: string;
  text: string;
  css: string;
  images: string[];
  metadata: {
    title: string;
    description: string | null;
    socialLinks: string[];
    hasEcommerce: boolean;
    hasBlog: boolean;
  };
  pages_analyzed: number;
  total_text_length: number;
  navigation_labels: string[];
}

export async function fetchAndParse(url: string, options: ExtractorOptions): Promise<ExtractedContent> {
  const normalizedUrl = normalizeUrl(url);
  
  if (!isValidUrl(normalizedUrl)) {
    throw new Error('Invalid URL format. Please provide a valid URL like https://example.com');
  }

  const axiosConfig = {
    timeout: options.timeout_ms || 15000,
    headers: {
      'User-Agent': options.user_agent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    maxRedirects: 5,
    httpsAgent
  };

  try {
    // Fetch homepage
    const response = await axios.get(normalizedUrl, axiosConfig);
    const $ = cheerio.load(response.data);
    
    let allHtml = response.data;
    let allText = extractTextContent($);
    let allCss = await extractAllCSS($, normalizedUrl, axiosConfig);
    let allImages = extractImages($, normalizedUrl);
    let pagesAnalyzed = 1;
    
    // Extract metadata from homepage
    const metadata = extractMetadata($);
    
    // Extract navigation labels
    const navigationLabels = extractNavigationLabels($);
    
    // Fetch subpages if requested
    if (options.include_subpages && (options.max_pages || 3) > 1) {
      const subpages = await findAndFetchSubpages(
        $, 
        normalizedUrl, 
        (options.max_pages || 3) - 1, 
        axiosConfig
      );
      
      for (const subpage of subpages) {
        allHtml += '\n' + subpage.html;
        allText += '\n\n' + subpage.text;
        allCss += '\n' + subpage.css;
        allImages.push(...subpage.images);
        pagesAnalyzed++;
      }
    }
    
    // Remove duplicates from images
    allImages = [...new Set(allImages)];
    
    return {
      html: allHtml,
      text: cleanText(allText),
      css: allCss,
      images: allImages,
      metadata,
      pages_analyzed: pagesAnalyzed,
      total_text_length: allText.length,
      navigation_labels: navigationLabels
    };
    
  } catch (error: any) {
    if (error.code === 'ENOTFOUND' || error.code === 'EAI_NONAME') {
      throw new Error('Could not resolve domain.');
    }
    if (error.response?.status) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Site took too long to respond.');
    }
    throw error;
  }
}

function extractTextContent($: cheerio.CheerioAPI): string {
  // Remove script and style elements
  $('script, style, noscript').remove();
  
  // Extract text from important elements, preserving structure
  const textElements: string[] = [];
  
  // Title and headings
  $('title, h1, h2, h3, h4, h5, h6').each((_, el) => {
    const text = $(el).text().trim();
    if (text) textElements.push(text + '\n');
  });
  
  // Paragraphs and main content
  $('p, div, span, article, section, main').each((_, el) => {
    const text = $(el).clone().children().remove().end().text().trim();
    if (text && text.length > 10) { // Only include substantial text
      textElements.push(text);
    }
  });
  
  // Navigation and menu items
  $('nav a, .nav a, .menu a').each((_, el) => {
    const text = $(el).text().trim();
    if (text) textElements.push(text);
  });
  
  return textElements.join(' ').replace(/\s+/g, ' ').trim();
}

async function extractAllCSS($: cheerio.CheerioAPI, baseUrl: string, axiosConfig: any): Promise<string> {
  let css = '';
  
  // Extract inline styles
  $('style').each((_, el) => {
    css += $(el).html() + '\n';
  });
  
  // Extract style attributes
  $('[style]').each((_, el) => {
    const style = $(el).attr('style');
    if (style) {
      css += `* { ${style} }\n`;
    }
  });
  
  // Extract linked stylesheets (limit to 3 to avoid excessive requests)
  const stylesheetLinks = $('link[rel="stylesheet"]').get().slice(0, 3);
  
  for (const link of stylesheetLinks) {
    try {
      const href = $(link).attr('href');
      if (href) {
        const cssUrl = new URL(href, baseUrl).href;
        const cssResponse = await axios.get(cssUrl, { 
          ...axiosConfig, 
          timeout: 5000 // Shorter timeout for CSS
        });
        css += cssResponse.data + '\n';
      }
    } catch (error) {
      // Ignore CSS fetch errors, continue with what we have
      console.warn('Failed to fetch CSS:', error);
    }
  }
  
  return css;
}

function extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const images: string[] = [];
  
  // Extract img src attributes
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      try {
        images.push(new URL(src, baseUrl).href);
      } catch (error) {
        // Invalid URL, skip
      }
    }
  });
  
  // Extract CSS background images
  $('[style*="background-image"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const bgImageMatch = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/);
    if (bgImageMatch) {
      try {
        images.push(new URL(bgImageMatch[1], baseUrl).href);
      } catch (error) {
        // Invalid URL, skip
      }
    }
  });
  
  return images;
}

function extractMetadata($: cheerio.CheerioAPI): {
  title: string;
  description: string | null;
  socialLinks: string[];
  hasEcommerce: boolean;
  hasBlog: boolean;
} {
  const title = $('title').text().trim() || $('h1').first().text().trim() || 'Unknown';
  
  const description = $('meta[name="description"]').attr('content') ||
                     $('meta[property="og:description"]').attr('content') ||
                     null;
  
  // Extract social media links
  const socialLinks: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && isSocialMediaUrl(href)) {
      socialLinks.push(href);
    }
  });
  
  // Detect e-commerce indicators
  const hasEcommerce = Boolean(
    $('*[class*="cart"], *[class*="shop"], *[class*="product"], *[class*="buy"], *[class*="checkout"]').length ||
    $('*[id*="cart"], *[id*="shop"], *[id*="product"], *[id*="buy"], *[id*="checkout"]').length ||
    $('input[type="submit"][value*="buy" i], input[type="submit"][value*="purchase" i]').length
  );
  
  // Detect blog indicators
  const hasBlog = Boolean(
    $('a[href*="blog"], a[href*="/post"], a[href*="/article"]').length ||
    $('*[class*="blog"], *[class*="post"], *[class*="article"]').length ||
    $('article, .entry, .post-content').length > 2
  );
  
  return {
    title,
    description,
    socialLinks: [...new Set(socialLinks)],
    hasEcommerce,
    hasBlog
  };
}

function extractNavigationLabels($: cheerio.CheerioAPI): string[] {
  const labels: string[] = [];
  
  // Extract from navigation elements
  $('nav a, .nav a, .navigation a, .menu a, header a').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 50) { // Reasonable navigation label length
      labels.push(text);
    }
  });
  
  return [...new Set(labels)]; // Remove duplicates
}

async function findAndFetchSubpages(
  $: cheerio.CheerioAPI, 
  baseUrl: string, 
  maxSubpages: number,
  axiosConfig: any
): Promise<Array<{html: string; text: string; css: string; images: string[]}>> {
  const subpages: Array<{html: string; text: string; css: string; images: string[]}> = [];
  const foundLinks: string[] = [];
  
  // Find internal links, preferring navigation links
  $('nav a, .nav a, .navigation a, .menu a, header a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && isInternalLink(href, baseUrl)) {
      const fullUrl = new URL(href, baseUrl).href;
      if (fullUrl !== baseUrl && !foundLinks.includes(fullUrl)) {
        foundLinks.push(fullUrl);
      }
    }
  });
  
  // If we don't have enough nav links, look for other internal links
  if (foundLinks.length < maxSubpages) {
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && isInternalLink(href, baseUrl)) {
        const fullUrl = new URL(href, baseUrl).href;
        if (fullUrl !== baseUrl && !foundLinks.includes(fullUrl)) {
          foundLinks.push(fullUrl);
        }
      }
    });
  }
  
  // Fetch up to maxSubpages
  for (let i = 0; i < Math.min(foundLinks.length, maxSubpages); i++) {
    try {
      const response = await axios.get(foundLinks[i], axiosConfig);
      const $subpage = cheerio.load(response.data);
      
      const text = extractTextContent($subpage);
      const css = await extractAllCSS($subpage, foundLinks[i], axiosConfig);
      const images = extractImages($subpage, foundLinks[i]);
      
      subpages.push({
        html: response.data,
        text,
        css,
        images
      });
      
    } catch (error) {
      // If a subpage fails, continue with others
      console.warn(`Failed to fetch subpage ${foundLinks[i]}:`, error);
    }
  }
  
  return subpages;
}