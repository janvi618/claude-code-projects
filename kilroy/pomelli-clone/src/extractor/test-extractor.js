/**
 * Simple test script for the Brand DNA Extractor
 * Run with: node test-extractor.js
 */

import { extract } from './index.js';

async function runTests() {
  console.log('Testing Brand DNA Extractor...\n');
  
  // Test 1: Invalid URL
  console.log('Test 1: Invalid URL');
  try {
    const result = await extract('not-a-url');
    console.log('✓ Handled invalid URL gracefully');
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Error: ${result.meta.error}\n`);
  } catch (error) {
    console.log('✗ Should handle invalid URLs gracefully');
    console.log(`  Error: ${error.message}\n`);
  }
  
  // Test 2: Non-existent domain
  console.log('Test 2: Non-existent domain');
  try {
    const result = await extract('https://thisdomaindoesnotexist12345.com');
    console.log('✓ Handled DNS error gracefully');
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Error: ${result.meta.error}\n`);
  } catch (error) {
    console.log('✗ Should handle DNS errors gracefully');
    console.log(`  Error: ${error.message}\n`);
  }
  
  // Test 3: Valid URL (example.com)
  console.log('Test 3: Valid URL (example.com)');
  try {
    const result = await extract('example.com'); // Should add https:// automatically
    console.log('✓ Successfully extracted Brand DNA');
    console.log(`  URL: ${result.url}`);
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Site Title: ${result.meta.site_title}`);
    console.log(`  Pages Analyzed: ${result.meta.pages_analyzed}`);
    console.log(`  Total Text Length: ${result.meta.total_text_length}`);
    console.log(`  Primary Colors: ${result.colors.primary.join(', ')}`);
    console.log(`  Typography Style: ${result.typography.font_style}`);
    console.log(`  Industry Guess: ${result.positioning.industry_guess}`);
    console.log(`  Tone: ${result.voice.tone_descriptors.join(', ')}\n`);
  } catch (error) {
    console.log('✗ Failed to extract from valid URL');
    console.log(`  Error: ${error.message}\n`);
  }
}

// Run tests
runTests().catch(console.error);