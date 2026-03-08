#!/usr/bin/env node

import { generate } from './src/generator/index.js';

// Mock BrandDNA for testing
const mockBrandDNA = {
  url: 'https://example.com',
  extracted_at: new Date().toISOString(),
  confidence: 0.85,
  colors: {
    primary: ['#007bff', '#0056b3'],
    secondary: ['#6c757d', '#868e96'],
    background: '#ffffff',
    text: '#212529',
    accent: '#28a745'
  },
  typography: {
    heading_fonts: ['Helvetica', 'Arial'],
    body_fonts: ['Arial', 'sans-serif'],
    font_style: 'modern'
  },
  imagery: {
    has_hero_image: true,
    image_count: 5,
    image_themes: ['professional', 'technology'],
    uses_illustrations: false,
    dominant_image_mood: 'professional'
  },
  voice: {
    tone_descriptors: ['professional', 'approachable', 'expert'],
    formality: 'formal',
    sentence_style: 'medium_balanced',
    uses_humor: false,
    uses_jargon: true,
    perspective: 'first_person_plural'
  },
  positioning: {
    industry_guess: 'Technology Consulting',
    target_audience_guess: 'Enterprise businesses',
    value_proposition: 'We help businesses transform through innovative technology solutions',
    key_messages: ['Innovation', 'Digital Transformation', 'Business Growth'],
    differentiators: ['20+ years experience', 'Fortune 500 clients', 'End-to-end solutions']
  },
  meta: {
    site_title: 'TechConsult Pro',
    meta_description: 'Leading technology consulting firm',
    pages_analyzed: 3,
    total_text_length: 5000,
    has_blog: true,
    has_ecommerce: false,
    social_links: ['https://linkedin.com/company/techconsult']
  }
};

async function testGenerator() {
  console.log('🧪 Testing Campaign Generator...\n');

  try {
    console.log('📝 Generating campaigns for spring promotion...');
    
    const result = await generate(mockBrandDNA, {
      goal: 'promote our spring technology refresh services',
      num_concepts: 2,
      platforms: ['instagram', 'linkedin'],
      posts_per_platform: 1
    });

    console.log('✅ Campaign generation completed!');
    console.log('📊 Results:');
    console.log(`   • Brand: ${result.brand_name}`);
    console.log(`   • Goal: ${result.campaign_goal}`);
    console.log(`   • Concepts generated: ${result.concepts.length}`);

    for (const concept of result.concepts) {
      console.log(`   • Concept ${concept.concept_number}: "${concept.campaign_name}"`);
      console.log(`     Tagline: ${concept.tagline}`);
      console.log(`     Posts: ${concept.posts.length} (${concept.posts.map(p => p.platform).join(', ')})`);
      
      // Check X post length if present
      const xPosts = concept.posts.filter(p => p.platform === 'x');
      for (const xPost of xPosts) {
        if (xPost.post_text.length > 280) {
          console.warn(`     ⚠️  X post exceeds 280 chars: ${xPost.post_text.length} characters`);
        }
      }
    }

    if (result.concepts.length === 0) {
      console.log('⚠️  No concepts generated - likely an API issue or configuration problem');
      return false;
    }

    console.log('\n🎯 Test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testGenerator().then(success => {
  if (!success) {
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Test crashed:', error);
  process.exit(1);
});