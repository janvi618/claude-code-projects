# Pomelli Clone — Scenarios (Holdout Validation Set)

## How to Use These Scenarios

These scenarios follow the StrongDM Software Factory methodology. They are "holdout sets" — descriptions of how a real user would use the Pomelli Clone, stored OUTSIDE the codebase. The coding agent that builds the app should never see these files.

### Evaluation Process

For each scenario:
1. Perform the described user actions against the running application
2. Evaluate each "Satisfaction Criteria" item
3. Score each criterion: SATISFIED (1), PARTIALLY SATISFIED (0.5), or NOT SATISFIED (0)
4. The scenario's satisfaction score = sum of criterion scores / total criteria
5. Overall satisfaction = average of all scenario scores

Target: 70% overall satisfaction for the CIO demo.

---

## Scenario A — The Bakery

**Persona:** Maria, owner of a small artisan bakery called "Sweet Crumbs" with a warm, cozy website featuring earthy tones, handwritten-style fonts, and photos of baked goods.

**User Journey:**
1. Maria opens the Pomelli Clone in her browser
2. She enters `https://sweetcrumbsbakery.com` (or a real bakery site you've selected)
3. She clicks "Analyze"
4. She views her Brand DNA profile
5. She enters "Promote our new sourdough bread workshop" as her campaign goal
6. She clicks "Generate Campaigns"
7. She reviews the generated campaigns
8. She copies an Instagram post to her clipboard

**Satisfaction Criteria:**
- [ ] The color palette includes warm/earthy tones (browns, creams, warm yellows) — not corporate blues
- [ ] The tone descriptors include words like "warm," "friendly," "homey," "inviting," or similar — not "professional" or "authoritative"
- [ ] The formality is rated "casual" or "very_casual" — not "formal"
- [ ] The industry guess mentions food, bakery, culinary, or similar
- [ ] The generated campaign names feel bakery-appropriate (not generic like "Spring Campaign 2026")
- [ ] Instagram posts use emoji and feel warm/inviting
- [ ] LinkedIn posts feel slightly more professional while maintaining warmth
- [ ] The campaign copy mentions or references baking, bread, workshops, or hands-on experience
- [ ] The suggested image prompts describe cozy, food-related visuals — not stock photo aesthetics
- [ ] The "Copy" button works and copies post text to clipboard

---

## Scenario B — The Law Firm

**Persona:** David, managing partner at "Chambers & Associates," a mid-size corporate law firm with a website featuring navy blues, grays, serif fonts, and professional headshot photography.

**User Journey:**
1. David opens the Pomelli Clone
2. He enters his firm's website URL
3. He views the Brand DNA profile
4. He enters "Announce our new cybersecurity practice group" as his campaign goal
5. He reviews the campaigns

**Satisfaction Criteria:**
- [ ] The color palette includes blues, grays, or dark professional tones — not bright or playful colors
- [ ] The tone descriptors include words like "authoritative," "professional," "expert," or "trustworthy"
- [ ] The formality is rated "formal" or "very_formal"
- [ ] The typography is classified as "classic" or "elegant" — not "playful"
- [ ] The industry guess mentions legal, law, or professional services
- [ ] The generated campaigns sound like a law firm — measured, credible, authoritative
- [ ] LinkedIn posts (the primary channel for law firms) feel polished and thought-leadership oriented
- [ ] X posts are concise and informative — not casual or humorous
- [ ] NO campaign uses excessive emoji, slang, or casual language
- [ ] The campaigns for David feel DISTINCTLY DIFFERENT from the campaigns for Maria (Scenario A)

---

## Scenario C — The Tech Startup

**Persona:** Priya, head of marketing at "NovaStack," a Series A developer tools startup with a website featuring gradients, dark backgrounds, monospace code fonts, and bold sans-serif typography.

**User Journey:**
1. Priya enters her startup's website URL
2. She views the Brand DNA profile
3. She enters "Launch our new CI/CD integration feature" as her campaign goal
4. She generates campaigns for X and LinkedIn only (unchecks Instagram if the option exists)

**Satisfaction Criteria:**
- [ ] The color palette detects dark/bold colors — not pastels or earth tones
- [ ] The typography is classified as "modern" or "technical"
- [ ] The tone includes words like "innovative," "cutting-edge," "technical," or "bold"
- [ ] The industry guess mentions technology, software, developer tools, or SaaS
- [ ] The target audience guess mentions developers, engineers, or technical teams
- [ ] The generated campaigns understand what CI/CD is and reference it correctly
- [ ] X posts feel like authentic developer-community communication — not corporate marketing
- [ ] The campaigns use appropriate technical language without being exclusionary
- [ ] The visual direction references modern tech aesthetics (gradients, dark mode, clean lines)
- [ ] The campaigns for Priya feel DISTINCTLY DIFFERENT from both Maria and David's campaigns

---

## Scenario D — Bad Input

**Persona:** A test user deliberately entering bad data.

**User Journey:**
1. The user enters "not a real url" and clicks Analyze
2. Then enters "https://thisdomaindoesnotexist99999.com" and clicks Analyze
3. Then enters "https://httpstat.us/500" (a URL that returns a 500 error) and clicks Analyze

**Satisfaction Criteria:**
- [ ] "not a real url" shows a validation error BEFORE making any network request
- [ ] The nonexistent domain shows a user-friendly error message (not a stack trace or raw error)
- [ ] The 500-error URL shows a message indicating the website couldn't be reached
- [ ] At no point does the app crash, show a white screen, or become unresponsive
- [ ] After any error, the user can immediately try a new URL without refreshing the page

---

## Scenario E — Minimal Website

**Persona:** Jake, who has a very simple one-page portfolio site with minimal styling — just a white background, one heading, two paragraphs of text, an email link, and no images.

**User Journey:**
1. Jake enters his minimal portfolio URL
2. He views the Brand DNA profile
3. He generates campaigns with goal "Get freelance clients"

**Satisfaction Criteria:**
- [ ] The extractor completes without crashing
- [ ] The confidence score is LOW (below 0.5) — reflecting that there wasn't much to work with
- [ ] The color palette section gracefully handles having few/no colors (doesn't show empty swatches)
- [ ] The voice analysis still produces SOMETHING reasonable based on the limited text
- [ ] The campaign generation still works, even with a sparse Brand DNA
- [ ] The campaigns acknowledge the personal/freelance nature of the brand

---

## Scenario F — Speed Test

**Persona:** The CIO watching the live demo.

**User Journey:**
1. The presenter enters a URL
2. The CIO watches the screen

**Satisfaction Criteria:**
- [ ] The loading state appears WITHIN 1 second of clicking "Analyze" (no frozen UI)
- [ ] The loading phase text changes at least twice during extraction (showing progress)
- [ ] The total time from "Analyze" click to Brand DNA display is under 20 seconds
- [ ] The total time from "Generate" click to campaign display is under 15 seconds
- [ ] The app never appears frozen or unresponsive during processing

---

## Scenario G — The "Show Two Brands" Demo Flow

**Persona:** The demo presenter (you) showing the CIO the contrast between two brands.

**User Journey:**
1. Enter a bakery/restaurant website → show Brand DNA → generate campaigns
2. Click "Start Over"
3. Enter a law firm/financial services website → show Brand DNA → generate campaigns
4. Point out the differences

**Satisfaction Criteria:**
- [ ] "Start Over" returns cleanly to Step 1 with no leftover state from the previous run
- [ ] The Brand DNA profiles for the two sites are visually and substantively different
- [ ] The color palettes are clearly different
- [ ] The tone descriptors are clearly different
- [ ] Given the SAME campaign goal (e.g., "grow social media following"), the campaigns are distinctly tailored to each brand
- [ ] The contrast is obvious enough that a non-technical CIO immediately sees the value
- [ ] The whole two-brand demo completes in under 3 minutes

---

## Scenario H — The "What's Next?" Question

**Persona:** The CIO, after seeing the demo, asks "What would it take to make this production-ready?"

This isn't a scenario you test against the app — it's a conversation scenario. You should be prepared to answer:

**Prepared Talking Points:**
- "We'd add image generation using an AI image API so campaigns include actual visual assets, not just prompts"
- "We'd add direct publishing integrations — post directly to Instagram, LinkedIn, X via their APIs"
- "We'd add a saved brand profile feature so users don't re-extract every time"
- "We'd add A/B testing — generate multiple variations and let the AI predict which will perform better"
- "But the bigger story is the METHOD: we built this in two weekends using specs and coding agents. Imagine applying this approach to our actual product roadmap."
