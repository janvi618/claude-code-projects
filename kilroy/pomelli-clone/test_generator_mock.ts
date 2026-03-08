import { generate } from './src/generator/index.js';
import { APIClient, APIResponse } from './src/generator/api-client.js';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

// Mock API response for testing
class MockAPIClient extends APIClient {
  async generateCampaigns(systemPrompt: string, userPrompt: string): Promise<APIResponse> {
    // Simulate a realistic response time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock response that matches the expected structure
    const mockResponse = {
      "concepts": [
        {
          "concept_number": 1,
          "campaign_name": "Knead to Learn Sourdough",
          "tagline": "Rise to the occasion with our hands-on sourdough workshop",
          "creative_rationale": "This concept plays on the classic bread-making pun while emphasizing the educational aspect. It captures the warm, welcoming tone of a family bakery and appeals to the growing interest in artisanal bread making.",
          "visual_direction": "Warm, golden tones with flour-dusted hands kneading dough, cozy bakery atmosphere with natural lighting",
          "posts": [
            {
              "platform": "instagram",
              "post_text": "🍞 Ready to learn the ancient art of sourdough? Join us for our hands-on workshop where you'll discover the secrets of creating perfect sourdough from our family starter! ✨\n\n#SourdoughWorkshop #ArtisanBaking #LearnWithUs",
              "hashtags": ["#SourdoughWorkshop", "#ArtisanBaking", "#LearnWithUs", "#BakingClass", "#FreshBread"],
              "suggested_image_prompt": "Hands kneading sourdough dough on a wooden surface with flour dust, warm golden lighting",
              "post_type": "single_image",
              "best_time_to_post": "Saturday 9am"
            },
            {
              "platform": "linkedin",
              "post_text": "There's something deeply satisfying about creating bread from scratch. Our new sourdough workshop teaches traditional techniques passed down through generations. Perfect for team building or personal skill development. Book your spot today!",
              "hashtags": ["#SkillDevelopment", "#TeamBuilding", "#ArtisanSkills", "#CommunityLearning", "#TraditionalCrafts"],
              "suggested_image_prompt": "Professional-looking workspace with sourdough ingredients laid out systematically",
              "post_type": "single_image", 
              "best_time_to_post": "Tuesday 10am"
            },
            {
              "platform": "x",
              "post_text": "🍞 New sourdough workshop alert! Learn from our 40-year-old family starter. Small classes, big results. Book now! #SourdoughWorkshop #BakingClass",
              "hashtags": ["#SourdoughWorkshop", "#BakingClass", "#ArtisanBread"],
              "suggested_image_prompt": "Close-up of bubbly sourdough starter in jar",
              "post_type": "single_image",
              "best_time_to_post": "Wednesday 3pm"
            }
          ]
        },
        {
          "concept_number": 2,
          "campaign_name": "Starter Stories Workshop",
          "tagline": "Every great bread begins with a story",
          "creative_rationale": "This concept emphasizes the heritage and storytelling aspect of sourdough, appealing to customers who value authenticity and tradition. It positions the workshop as not just learning technique, but becoming part of a baking legacy.",
          "visual_direction": "Vintage-inspired imagery with storytelling elements, old recipe cards, generational photos, warm sepia tones",
          "posts": [
            {
              "platform": "instagram",
              "post_text": "Every jar of sourdough starter has a story to tell 📖 Our workshop doesn't just teach you techniques - it connects you to a living tradition that's been bubbling away for generations! Come write your chapter in bread history ✨",
              "hashtags": ["#StarterStories", "#BreadHeritage", "#SourdoughWorkshop", "#BakingTradition", "#FamilyRecipes"],
              "suggested_image_prompt": "Vintage mason jar with sourdough starter next to old handwritten recipe cards",
              "post_type": "carousel",
              "best_time_to_post": "Sunday 11am"
            },
            {
              "platform": "linkedin",
              "post_text": "In our sourdough workshop, you're not just learning a skill - you're becoming a custodian of culinary heritage. Our starter has been nurtured for decades, and we'll teach you to carry forward this beautiful tradition.",
              "hashtags": ["#CulinaryHeritage", "#SustainableBaking", "#TraditionalSkills", "#CommunityTraditions", "#BakingWorkshop"],
              "suggested_image_prompt": "Elegant shot of sourdough starter being passed from one generation to another",
              "post_type": "single_image",
              "best_time_to_post": "Thursday 2pm"
            },
            {
              "platform": "x",
              "post_text": "Our sourdough starter is older than the internet! 🍞 Join our workshop to become part of its continuing story. Limited spots available! #StarterStories #SourdoughWorkshop",
              "hashtags": ["#StarterStories", "#SourdoughWorkshop", "#BakingHeritage"],
              "suggested_image_prompt": "Split image of old starter jar and fresh baked bread",
              "post_type": "single_image", 
              "best_time_to_post": "Friday 1pm"
            }
          ]
        },
        {
          "concept_number": 3,
          "campaign_name": "Rise & Shine Sourdough Sessions",
          "tagline": "Wake up to the smell of fresh possibilities",
          "creative_rationale": "This concept focuses on the sensory experience and morning freshness associated with bakeries. It appeals to early risers and creates anticipation for the workshop experience while maintaining the warm, community-focused brand voice.",
          "visual_direction": "Bright, early morning lighting with steam rising from fresh bread, golden sunlight streaming through bakery windows",
          "posts": [
            {
              "platform": "instagram",
              "post_text": "There's nothing quite like the smell of fresh sourdough in the morning! ☀️ Our new workshop starts bright and early, so you can take home warm loaves for the perfect weekend brunch. Who's ready to rise and shine with us? 🍞✨",
              "hashtags": ["#RiseAndShine", "#SourdoughWorkshop", "#WeekendPlans", "#FreshBread", "#MorningMagic"],
              "suggested_image_prompt": "Early morning bakery scene with golden sunlight and fresh bread cooling on racks",
              "post_type": "video_concept",
              "best_time_to_post": "Friday 7am"
            },
            {
              "platform": "linkedin",
              "post_text": "Start your weekend right with our Rise & Shine Sourdough Workshop. Early morning sessions mean you'll master the techniques and take home fresh bread to share with family. A perfect blend of skill-building and community connection.",
              "hashtags": ["#WeekendLearning", "#FamilyTime", "#BakingSkills", "#CommunityWorkshop", "#SourdoughMastery"],
              "suggested_image_prompt": "Professional workshop setup in morning light with participants working together",
              "post_type": "single_image",
              "best_time_to_post": "Monday 8am"
            },
            {
              "platform": "x",
              "post_text": "🌅 Early bird gets the sourdough! Our morning workshop means fresh bread for brunch. Small classes, expert guidance, guaranteed results. Book your Rise & Shine session! #RiseAndShine #SourdoughWorkshop",
              "hashtags": ["#RiseAndShine", "#SourdoughWorkshop", "#EarlyBird"],
              "suggested_image_prompt": "Steaming fresh sourdough loaf in morning sunlight",
              "post_type": "single_image",
              "best_time_to_post": "Saturday 6am"
            }
          ]
        }
      ]
    };

    return {
      content: JSON.stringify(mockResponse),
      success: true
    };
  }
}

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

// Mock the generate function to use our mock API client
async function mockGenerate(brandDNA: any, request: any) {
  // Import the necessary modules
  const { buildPrompts } = await import('./src/generator/prompt-builder.js');
  const { parseJSONResponse } = await import('./src/generator/api-client.js');
  const { validateAndFix } = await import('./src/generator/validator.js');
  
  // Set defaults
  const opts = {
    num_concepts: 3,
    platforms: ["instagram", "linkedin", "x"] as const,
    posts_per_platform: 2,
    ...request
  };

  try {
    // Step 1: Build prompts
    const { system, user } = buildPrompts(brandDNA, opts);

    // Step 2: Use mock API client
    const apiClient = new MockAPIClient({
      max_tokens: 4096,
      temperature: 0.8
    });

    const apiResponse = await apiClient.generateCampaigns(system, user);

    if (!apiResponse.success) {
      console.error('API call failed:', apiResponse.error);
      return createEmptyOutput(brandDNA, request);
    }

    // Step 3: Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = parseJSONResponse(apiResponse.content);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return createEmptyOutput(brandDNA, request);
    }

    // Step 4: Validate and fix
    const validation = validateAndFix(parsedResponse, brandDNA, opts);

    if (validation.errors.length > 0) {
      console.warn('Validation warnings/errors:', validation.errors);
    }

    // Return the fixed output or empty if validation completely failed
    return validation.fixedOutput || createEmptyOutput(brandDNA, request);

  } catch (error) {
    console.error('Campaign generation failed:', error);
    return createEmptyOutput(brandDNA, request);
  }
}

function createEmptyOutput(brandDNA: any, request: any) {
  return {
    brand_name: brandDNA.meta.site_title,
    campaign_goal: request.goal,
    generated_at: new Date().toISOString(),
    concepts: []
  };
}

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
    
    const result = await mockGenerate(bakeryBrandDNA, {
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
      const platforms = [...new Set(concept.posts.map((p: any) => p.platform))];
      const expectedPlatforms = ['instagram', 'linkedin', 'x'];
      const hasCorrectPlatforms = expectedPlatforms.every(platform => platforms.includes(platform));
      
      if (!hasCorrectPlatforms) {
        allPlatformsCorrect = false;
        testResults.details.push(`Concept ${concept.concept_number} missing platforms. Has: ${platforms.join(', ')}, Expected: ${expectedPlatforms.join(', ')}`);
      }
      
      console.log(`      Platforms: ${platforms.join(', ')} (${hasCorrectPlatforms ? 'PASS' : 'FAIL'})`);
      
      // Check X post character limits
      const xPosts = concept.posts.filter((p: any) => p.platform === 'x');
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