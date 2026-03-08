import { generate } from './src/generator/index.js';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

// Mock BrandDNA representing a bakery (warm colors, casual tone, food industry)
const bakeryBrandDNA = {
  url: 'https://sunnyvalleybakery.com',
  extracted_at: new Date().toISOString(),
  confidence: 0.9,
  colors: {
    primary: ['#D4A574', '#A0522D', '#8B4513'],  // warm browns/golds
    secondary: ['#F5DEB3', '#DEB887', '#CD853F', '#DAA520', '#B8860B'],  // warm tans/golds
    background: '#FFF8DC',  // cornsilk - warm cream
    text: '#3E2723',  // warm dark brown
    accent: '#FF6B35'  // warm orange accent
  },
  typography: {
    heading_fonts: ['Georgia', 'Times New Roman'],
    body_fonts: ['Open Sans', 'Arial'],
    font_style: 'classic' as const
  },
  imagery: {
    has_hero_image: true,
    image_count: 12,
    image_themes: ['food', 'bakery', 'artisanal', 'people'],
    uses_illustrations: false,
    dominant_image_mood: 'warm'
  },
  voice: {
    tone_descriptors: ['warm', 'friendly', 'welcoming', 'passionate', 'authentic'],
    formality: 'casual' as const,
    sentence_style: 'medium_balanced' as const,
    uses_humor: true,
    uses_jargon: false,
    perspective: 'first_person_plural' as const  // "we"
  },
  positioning: {
    industry_guess: 'Food & Beverage - Artisanal Bakery',
    target_audience_guess: 'Local community, food enthusiasts, families',
    value_proposition: 'We craft fresh, artisanal baked goods using traditional methods and local ingredients',
    key_messages: ['Fresh daily', 'Local ingredients', 'Traditional recipes', 'Community gathering place'],
    differentiators: ['Family-owned since 1985', 'Sourdough starter from grandmas recipe', 'All organic flour']
  },
  meta: {
    site_title: 'Sunny Valley Bakery',
    meta_description: 'Fresh artisanal breads and pastries baked daily with love',
    pages_analyzed: 4,
    total_text_length: 3500,
    has_blog: true,
    has_ecommerce: false,
    social_links: ['https://instagram.com/sunnyvalleybakery', 'https://facebook.com/sunnyvalleybakery']
  }
};

async function testBakeryGenerator() {
  console.log('🧪 Testing Campaign Generator with Bakery Brand DNA...\n');
  
  const startTime = Date.now();
  let testResults = {
    hasThreeConcepts: false,
    hasCorrectPlatforms: false,
    xPostsUnder280: true,
    hasDistinctCampaignNames: false,
    completedInTime: false,
    details: []
  };

  try {
    console.log('📝 Generating campaigns for sourdough workshop promotion...');
    
    const result = await generate(bakeryBrandDNA, {
      goal: 'promote our new sourdough workshop'
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    testResults.completedInTime = duration <= 30000;
    
    console.log('✅ Campaign generation completed!');
    console.log(`⏱️ Duration: ${duration}ms (${testResults.completedInTime ? 'PASS' : 'FAIL'} - must be ≤30s)`);
    console.log('📊 Results:');
    console.log(`   • Brand: ${result.brand_name}`);
    console.log(`   • Goal: ${result.campaign_goal}`);
    console.log(`   • Concepts generated: ${result.concepts.length}`);

    // Check 1: Must return 3 campaign concepts
    testResults.hasThreeConcepts = result.concepts.length === 3;
    console.log(`   • Three concepts: ${testResults.hasThreeConcepts ? 'PASS' : 'FAIL'} (got ${result.concepts.length})`);
    
    if (!testResults.hasThreeConcepts) {
      testResults.details.push(`Expected 3 concepts, got ${result.concepts.length}`);
    }

    // Check concept details
    const campaignNames: string[] = [];
    let allPlatformsCorrect = true;
    
    for (const [index, concept] of result.concepts.entries()) {
      console.log(`\n   🎯 Concept ${concept.concept_number}: "${concept.campaign_name}"`);
      console.log(`      Tagline: ${concept.tagline}`);
      console.log(`      Posts: ${concept.posts.length}`);
      
      campaignNames.push(concept.campaign_name);
      
      // Check platforms for this concept
      const platforms = [...new Set(concept.posts.map(p => p.platform))];
      const expectedPlatforms = ['instagram', 'linkedin', 'x'];
      const hasCorrectPlatforms = expectedPlatforms.every(platform => platforms.includes(platform));
      
      if (!hasCorrectPlatforms) {
        allPlatformsCorrect = false;
        testResults.details.push(`Concept ${concept.concept_number} missing platforms. Has: ${platforms.join(', ')}, Expected: ${expectedPlatforms.join(', ')}`);
      }
      
      console.log(`      Platforms: ${platforms.join(', ')} (${hasCorrectPlatforms ? 'PASS' : 'FAIL'})`);
      
      // Check X post character limits
      const xPosts = concept.posts.filter(p => p.platform === 'x');
      for (const xPost of xPosts) {
        const length = xPost.post_text.length;
        const isUnder280 = length <= 280;
        if (!isUnder280) {
          testResults.xPostsUnder280 = false;
          testResults.details.push(`X post in concept ${concept.concept_number} exceeds 280 chars: ${length} characters`);
        }
        console.log(`      X post length: ${length} chars (${isUnder280 ? 'PASS' : 'FAIL'})`);
      }
    }

    // Check 2: Each has posts for instagram, linkedin, and x
    testResults.hasCorrectPlatforms = allPlatformsCorrect;
    
    // Check 4: Each concept has distinct campaign_name
    const uniqueNames = [...new Set(campaignNames)];
    testResults.hasDistinctCampaignNames = uniqueNames.length === campaignNames.length;
    console.log(`\n   • Distinct campaign names: ${testResults.hasDistinctCampaignNames ? 'PASS' : 'FAIL'}`);
    if (!testResults.hasDistinctCampaignNames) {
      testResults.details.push(`Duplicate campaign names found: ${campaignNames.join(', ')}`);
    }
    
    // Overall test result
    const allTestsPassed = testResults.hasThreeConcepts && 
                           testResults.hasCorrectPlatforms && 
                           testResults.xPostsUnder280 && 
                           testResults.hasDistinctCampaignNames && 
                           testResults.completedInTime;

    console.log(`\n🎯 Overall Test Result: ${allTestsPassed ? 'SUCCESS' : 'FAILURE'}`);
    
    if (testResults.details.length > 0) {
      console.log('\n❌ Issues found:');
      testResults.details.forEach(detail => console.log(`   • ${detail}`));
    }

    return {
      success: allTestsPassed,
      details: testResults.details.length > 0 ? testResults.details.join('; ') : undefined
    };

  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error('❌ Test failed:', error.message);
    console.log(`⏱️ Duration: ${duration}ms`);
    
    return {
      success: false,
      details: `Test threw error: ${error.message}`
    };
  }
}

// Function to write status file
function writeStatus(outcome: string, reason?: string) {
  const status = reason ? { outcome, reason } : { outcome };
  
  // Try primary path first
  const primaryPath = process.env.KILROY_STAGE_STATUS_PATH || './status.json';
  const fallbackPath = process.env.KILROY_STAGE_STATUS_FALLBACK_PATH;
  
  try {
    writeFileSync(primaryPath, JSON.stringify(status, null, 2));
    console.log(`✅ Status written to: ${primaryPath}`);
  } catch (error: any) {
    console.warn(`⚠️ Failed to write to primary path (${primaryPath}):`, error.message);
    
    if (fallbackPath) {
      try {
        // Ensure directory exists
        const fallbackDir = path.dirname(fallbackPath);
        mkdirSync(fallbackDir, { recursive: true });
        writeFileSync(fallbackPath, JSON.stringify(status, null, 2));
        console.log(`✅ Status written to fallback: ${fallbackPath}`);
      } catch (fallbackError: any) {
        console.error(`❌ Failed to write to fallback path (${fallbackPath}):`, fallbackError.message);
        // Write to current directory as last resort
        writeFileSync('./status.json', JSON.stringify(status, null, 2));
        console.log(`✅ Status written to: ./status.json`);
      }
    } else {
      // Write to current directory as fallback
      writeFileSync('./status.json', JSON.stringify(status, null, 2));
      console.log(`✅ Status written to: ./status.json`);
    }
  }
}

// Run the test
testBakeryGenerator().then(result => {
  if (result.success) {
    writeStatus('success');
    console.log('\n🎉 All tests passed!');
  } else {
    writeStatus('failure', result.details);
    console.log('\n💥 Test failed!');
    process.exit(1);
  }
}).catch((error: any) => {
  writeStatus('failure', `Test crashed: ${error.message}`);
  console.error('❌ Test crashed:', error);
  process.exit(1);
});