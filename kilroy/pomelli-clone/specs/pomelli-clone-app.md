# Pomelli Clone — Web Application

## Natural Language Specification v1.0

This document is a natural language specification (NLSpec). It is intended to be read and implemented by a coding agent without human intervention.

---

## 1. Purpose

The Pomelli Clone web application is a single-page app that connects the Brand DNA Extractor and Campaign Generator into a user-facing experience. It follows the same three-step flow as Google's Pomelli: enter a URL, view the brand profile, generate campaigns.

The app exists to demonstrate the concept in a CIO presentation. It must look polished but does not need production-grade infrastructure. It runs locally via `npm start` or deploys to a static hosting provider.

---

## 2. User Flow

### Step 1: Enter URL

The user sees a clean landing screen with:
- A headline: "Pomelli Clone — AI-Powered Brand Marketing"
- A subtitle: "Enter your website URL and we'll build your brand profile and generate campaigns"
- A large text input for the URL
- An "Analyze" button
- A small footer: "Built using the StrongDM Software Factory method — spec-driven, agent-built"

When the user clicks "Analyze":
- Validate the URL (basic format check — does it start with http:// or https://)
- If invalid, show an inline error below the input: "Please enter a valid URL including https://"
- If valid, transition to a loading state and call the Brand DNA Extractor

The loading state shows:
- A progress indicator (spinner or animated bar)
- Text that updates through phases: "Fetching website..." → "Analyzing visual identity..." → "Understanding brand voice..." → "Building Brand DNA profile..."
- The phase text changes every 3-4 seconds to give a sense of progress (this is cosmetic — the actual extraction is a single async call)

### Step 2: View Brand DNA

After extraction completes, display the Brand DNA as a visual profile card. This is the "wow" moment — the user sees their brand identity reflected back to them.

**Layout — a single-scroll card with these sections:**

**Header section:**
- The site title in large text
- The URL below it in smaller gray text
- A confidence badge (e.g., "High confidence" in green if > 0.7, "Medium" in yellow if > 0.4, "Low" in red otherwise)

**Color palette section:**
- Label: "Your Brand Colors"
- A horizontal row of color swatches showing primary colors (large circles) and secondary colors (smaller circles)
- Each swatch shows the hex code below it
- The accent color (if detected) gets a small "CTA" label

**Typography section:**
- Label: "Your Typography"
- Show the heading font name rendered in itself (if it's a Google Font, load it; otherwise just show the name)
- Show the body font name
- A small tag showing the `font_style` classification

**Voice section:**
- Label: "Your Brand Voice"
- Show the `tone_descriptors` as pill/tag elements
- A horizontal scale showing formality level (very_formal to very_casual with an indicator dot)
- The `perspective` shown as a sentence like: "You speak in first person plural ('we')"

**Positioning section:**
- Label: "Your Market Position"
- `industry_guess` and `target_audience_guess` as labeled text
- `value_proposition` in a highlighted/quote block
- `key_messages` as a small bulleted list
- `differentiators` as a small bulleted list

**Action section:**
- A large "Generate Campaigns" button
- A text input or dropdown for the campaign goal (with placeholder: "e.g., Promote our spring sale, Launch new product, Grow social following")
- Optional: platform checkboxes (Instagram, LinkedIn, X) — all checked by default

### Step 3: Campaign Results

After generation completes, display below the Brand DNA card (or as a new scrollable section):

**For each campaign concept, show a card:**
- Campaign name as the card title
- Tagline in italic below
- Creative rationale in a subtle box
- Visual direction note
- A tabbed or segmented view of posts by platform:
  - Each post shows: the post text, hashtags as tags, the image prompt in a collapsible section, the suggested post type, and best time
- A "Copy" button next to each post that copies the post text + hashtags to clipboard

**At the bottom:**
- A "Generate More" button that re-runs the Campaign Generator with the same BrandDNA and goal
- A "Start Over" button that returns to Step 1

---

## 3. Visual Design

The app should look modern and professional. It is NOT trying to replicate Google's Pomelli visually — it should have its own identity.

**Design tokens:**
- Background: #FAFAFA (light gray)
- Card background: #FFFFFF
- Primary text: #1A1A2E (near-black navy)
- Secondary text: #6B7280 (gray)
- Primary accent: #6366F1 (indigo)
- Secondary accent: #10B981 (emerald, for success states)
- Error: #EF4444 (red)
- Border radius: 12px on cards, 8px on inputs and buttons
- Font: system font stack — `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Card shadow: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`

**Responsive:** The app should work on desktop (1024px+). Mobile responsiveness is a nice-to-have, not a requirement.

**Animations:**
- Fade-in on section transitions
- Skeleton loading states for the Brand DNA card while extracting
- Smooth scroll to the campaign results when they appear

---

## 4. Technical Architecture

### Frontend

- **Framework:** React (with hooks, functional components only)
- **Styling:** CSS-in-JS (styled-components) or Tailwind CSS or plain CSS modules — agent's choice
- **State management:** React useState and useReducer — no Redux or external state libraries
- **Build tool:** Vite

### Backend

- **Framework:** Express.js (minimal)
- **Routes:**
  - `POST /api/extract` — accepts `{ url, options? }`, calls the Brand DNA Extractor, returns BrandDNA JSON
  - `POST /api/generate` — accepts `{ brandDNA, request }`, calls the Campaign Generator, returns CampaignOutput JSON
  - `GET /api/health` — returns `{ status: "ok" }`
- **CORS:** Enable for localhost origins
- **Error handling:** All routes return JSON errors with appropriate HTTP status codes

### Configuration

- **Environment variables:**
  - `ANTHROPIC_API_KEY` — required for AI features
  - `PORT` — server port, default 3001
  - `VITE_API_URL` — frontend API base URL, default `http://localhost:3001`

### Project Structure

```
pomelli-clone/
├── specs/                          # These spec files (not consumed by the app)
│   ├── brand-dna-extractor.md
│   ├── campaign-generator.md
│   └── pomelli-clone-app.md
├── scenarios/                      # Holdout scenarios (not consumed by the app)
├── server/
│   ├── index.ts                    # Express server setup
│   ├── routes/
│   │   ├── extract.ts              # POST /api/extract
│   │   └── generate.ts             # POST /api/generate
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.tsx                 # Main app component with step state machine
│   │   ├── components/
│   │   │   ├── URLInput.tsx        # Step 1: URL entry
│   │   │   ├── BrandDNACard.tsx    # Step 2: Brand profile display
│   │   │   ├── CampaignResults.tsx # Step 3: Generated campaigns
│   │   │   ├── ColorPalette.tsx    # Color swatch component
│   │   │   ├── VoiceProfile.tsx    # Voice/tone visualization
│   │   │   ├── PostCard.tsx        # Individual social post display
│   │   │   └── LoadingState.tsx    # Animated loading screen
│   │   ├── index.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   └── package.json
├── src/                            # Shared modules (extractor + generator)
│   ├── extractor/
│   └── generator/
├── package.json                    # Root package.json with workspaces or scripts
└── README.md
```

---

## 5. Startup & Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "tsx server/index.ts",
    "client": "cd client && vite",
    "build": "cd client && vite build",
    "start": "npm run dev"
  }
}
```

The user should be able to:
1. Clone the repo
2. Run `npm install`
3. Set `ANTHROPIC_API_KEY` in a `.env` file
4. Run `npm start`
5. Open `http://localhost:5173` in a browser

---

## 6. Demo Mode

For the CIO presentation, the app should support a "demo mode" where:
- Pre-cached BrandDNA profiles for 2-3 websites are stored in a `demo-data/` directory
- If the entered URL matches a cached profile, the app loads instantly (no network fetch needed)
- This prevents live demo failures from slow websites or network issues

To enable demo mode, set `DEMO_MODE=true` in the environment. When enabled:
- The URL input shows placeholder suggestions: "Try: sweetcrumbsbakery.com, acmelaw.com, novatech.io"
- These map to pre-cached JSON files in `demo-data/`

---

## 7. Definition of Done

1. `npm start` launches both server and client without errors
2. Entering a URL and clicking "Analyze" produces a Brand DNA card
3. Clicking "Generate Campaigns" produces campaign concepts with social posts
4. The "Copy" button on posts works (copies to clipboard)
5. The loading states show animated progress
6. The color palette section renders actual color swatches
7. Error states (invalid URL, network failure) show user-friendly messages
8. Demo mode works with at least 2 pre-cached brand profiles
9. The entire flow completes in under 60 seconds for a typical website
