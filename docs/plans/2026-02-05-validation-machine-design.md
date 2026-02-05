# Self-Running Validation Business - Design Document

**Date:** 2026-02-05
**Status:** Draft
**Author:** Collaborative design session

---

## Overview

A self-service internal tool where product teams submit an idea + target audience, and the system automatically validates market demand by running real ads to real people.

### Core Workflow

```
Team submits idea → System generates assets → Ads run → Data collected → Results delivered
     (1 min)            (automated)         (days)      (automated)       (automated)
```

### What It Does

- Takes a product concept + target audience description
- Auto-generates 2-3 landing page variants + ad creatives
- Runs ads on Meta (or simulates for testing)
- Collects email signups and tracks behavior
- Delivers Go/No-Go recommendation with full metrics

### What It Explicitly Doesn't Do

- Take payments or fulfill orders
- Make final product decisions (that's still human)
- Guarantee success (validates *interest*, not *willingness to pay*)

---

## Target Users

Internal product teams at companies who want to test new features/products before investing in building them.

---

## Component Design

### 1. Idea Intake

**Input form:**
- **Product Concept** (text): Description of the product/feature idea
- **Target Audience** (text): Demographics, behaviors, characteristics
- **Test Settings:**
  - Budget (default: $300)
  - Max duration (default: 7 days)
  - Stop threshold (default: 50 signups or budget exhausted)

**On submit:**
1. System parses concept to extract key value props
2. Maps audience description to Meta targeting parameters
3. Queues asset generation
4. Sends team confirmation with estimated timeline

---

### 2. Asset Generator

**Landing Pages (3 variants):**
- **Variant A:** Benefit-focused - Leads with the outcome
- **Variant B:** Problem-focused - Leads with the pain point
- **Variant C:** Social proof angle - Leads with validation

**Each landing page includes:**
- Headline + subhead
- 3 bullet points of benefits
- Simple visual (stock image matched to audience)
- Email signup form with clear CTA
- Legal fine print (privacy policy, "coming soon" disclosure)

**Ad Creatives (2 per variant):**
- Image ad with headline overlay
- Short copy (punchy) and medium copy (explanatory) variations

**How it works:**
1. Claude API generates copy based on concept + audience
2. System selects stock images from curated library or Unsplash API
3. Landing pages built from templates (fast, reliable, mobile-ready)
4. Ads formatted to Meta specs automatically

**Human review:** Optional preview before launch, but default is auto-approve.

---

### 3. Campaign Manager

**Campaign structure:**
```
Campaign: "[Product] Validation - [Date]"
├── Ad Set A (Variant A landing page)
│   ├── Image Ad - Short copy
│   └── Image Ad - Medium copy
├── Ad Set B (Variant B landing page)
│   ├── Image Ad - Short copy
│   └── Image Ad - Medium copy
└── Ad Set C (Variant C landing page)
    ├── Image Ad - Short copy
    └── Image Ad - Medium copy
```

**Targeting:**
- System translates audience description → Meta targeting parameters
- Age, location, interests, behaviors mapped automatically

**Budget allocation:**
- Starts with even split across variants
- After 48 hours, shifts budget toward best performers
- Never exceeds user-set budget cap

**Automated monitoring:**
- Checks performance every 6 hours
- Pauses underperforming ads (CTR < 0.5%)
- Stops campaign when threshold hit
- Alerts team if something looks wrong

**Platform support:**
- MVP: Meta (Facebook/Instagram) only
- Architecture supports adding Google, LinkedIn later

---

### 4. Simulation Mode

**Purpose:**
- Demo the system without real ad spend
- Let teams try the workflow before going live
- Development and testing

**How it works:**
- Generates all assets (landing pages, ads) - **real**
- Deploys to Meta - **skipped**
- Traffic & signups - **simulated using industry benchmarks**
- Results dashboard - **shows realistic mock data**

**Simulated data based on:**
- Industry average CTRs (1-3% for Meta)
- Typical landing page conversion rates (10-25%)
- Realistic cost-per-click for audience type
- Randomized within realistic ranges

**Default:** Simulation Mode on. Live requires Meta account connection.

---

### 5. Data Collector

**Volume metrics:**
- Ad impressions and clicks
- Landing page visits (by variant)
- Email signups (by variant)
- Drop-off at each step

**Quality metrics:**
- Time on landing page
- Scroll depth
- Click patterns
- Device/location of signups

**Cost metrics:**
- Spend per variant
- Cost per click (CPC)
- Cost per signup (CPS)
- Projected customer acquisition cost (CAC)

**Tracking implementation:**
- Simple tracking pixel on landing pages
- UTM parameters link clicks to specific ads/variants
- Email stored with source attribution

**Email nurture flow:**
1. Signup → Immediate "Thanks! We're working on this" email
2. Store email with: timestamp, variant, source, location
3. If product launches → team can export list
4. If product killed → optional "Sorry, not happening" email

**Data retention:**
- Emails kept 12 months, then auto-deleted (GDPR-friendly)
- Analytics data anonymized after 90 days

---

### 6. Results Engine

**Executive Summary (one-page view):**
- Go / No-Go / Promising recommendation
- Score (0-100)
- Key metrics vs. benchmarks
- Winning variant identification
- Plain-language recommendation

**Scoring logic (0-100):**
- Volume vs. target (25 pts)
- Cost vs. benchmark (25 pts)
- Conversion rate vs. benchmark (25 pts)
- CTR vs. benchmark (25 pts)

**Thresholds:**
- 70+ = **Go** (strong signal)
- 40-69 = **Promising** (worth exploring)
- <40 = **No-Go** (weak interest)

**Detailed drill-down:**
- Hourly/daily performance charts
- Variant-by-variant comparison
- Audience breakdown (age, location, device)
- Full funnel visualization

**Export options:**
- PDF report
- CSV data export
- Email list export

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│         Next.js (React) + Tailwind CSS                 │
│     Dashboard, intake forms, results display            │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                      BACKEND                            │
│                   Next.js API Routes                    │
│    Handles auth, submissions, campaign orchestration    │
└───┬─────────────┬─────────────┬─────────────┬──────────┘
    │             │             │             │
┌───▼───┐   ┌─────▼─────┐  ┌────▼────┐  ┌────▼────┐
│ Claude │   │  Meta API │  │ Database │  │  Email  │
│  API   │   │(or mock)  │  │ Postgres │  │Resend/  │
│        │   │           │  │          │  │Sendgrid │
└────────┘   └───────────┘  └──────────┘  └─────────┘
```

**Tech stack:**
| Component | Service | Why |
|-----------|---------|-----|
| AI/Copy | Claude API | Reliable, good at marketing copy |
| Ads | Meta Marketing API | Start here, expand later |
| Database | Postgres (Railway/Supabase) | Relational, easy to query |
| Email | Resend or Sendgrid | Simple transactional email |
| Hosting | Vercel or Railway | Easy deploy, scales |
| Landing pages | Same app, dynamic routes | `/lp/[testId]/[variant]` |

**Data model:**
```
Team → has many → ValidationTests
ValidationTest → has many → Variants
Variant → has many → Signups
ValidationTest → has one → Results
```

---

## Implementation Phases

### MVP (2-3 weeks)
1. Idea intake form
2. Asset generator (Claude + templates)
3. Landing page hosting with tracking
4. Simulation mode with mock data
5. Results dashboard (executive summary + detail)

### Phase 2 (2-3 additional weeks)
- Meta API integration (live campaigns)
- Auto-optimization (shift budget to winners)
- Email nurture automation

### Phase 3 (future)
- Google Ads support
- LinkedIn Ads support
- Historical comparison (this test vs. past tests)
- Team accounts & permissions
- API for programmatic access

---

## Open Questions

1. **Stock images:** Curated library vs. Unsplash API vs. AI-generated?
2. **Landing page templates:** How many base designs to start?
3. **Benchmarks:** Where do industry benchmarks come from? Hardcoded or dynamic?
4. **Multi-team:** Does MVP need team/org separation or single-tenant OK?

---

## Success Criteria

MVP is successful if:
- A team can go from idea → results in under 15 minutes (simulation mode)
- Results clearly communicate go/no-go with supporting data
- System requires zero manual intervention once submitted
