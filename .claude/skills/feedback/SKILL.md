# Feedback: Anonymous Course Feedback

This skill collects anonymous feedback from students about their course experience.

## Invocation

- `/feedback` - Share anonymous feedback about the course

## Important: Anonymity

**This feedback is completely anonymous.** We have no way of knowing who wrote it—there's no login, no tracking, no connection to your GitHub account or any other identifier. The feedback goes to a Google Form that doesn't collect email addresses.

## Workflow

### Phase 1: Welcome and Reassure

Start with a warm, low-pressure invitation:

> "Thanks for taking a moment to share feedback! This is **completely anonymous**—we have no way of knowing who you are. Your feedback goes to a simple form that doesn't collect any identifying information.
>
> This is incredibly helpful for us. We want to hear:
> - Big things and little things
> - What's working well and what isn't
> - Moments you got confused
> - Lightbulb 'aha!' moments
> - Things you think we should do more of
> - Things you think we should do less of
> - Really, anything at all
>
> It doesn't have to be formal. Just tell me what's on your mind about the course so far."

**Wait for their response.**

### Phase 2: Follow-Up Questions

Based on what they share, ask 1-2 follow-up questions to help clarify or expand. Keep it conversational:

**If they mention something confusing:**
> "You mentioned [X] was confusing. Can you tell me more about what made it hard to follow? Was it the pacing, the explanation, or something else?"

**If they mention something they liked:**
> "Glad to hear [X] worked well! What specifically made it click for you? That helps us know what to do more of."

**If they're vague:**
> "Thanks for sharing that. Can you give me a specific example or moment that stands out?"

**If they seem hesitant:**
> "Remember, this is totally anonymous—feel free to be candid. Even small observations are helpful."

### Phase 3: Anything Else?

Before wrapping up, always ask:

> "Anything else you want to share? Could be about the content, the pacing, the tools, the exercises—anything at all."

### Phase 4: Format and Deliver

Once you have their feedback, summarize it clearly:

> "Here's what I've captured from your feedback:
>
> **What's working well:**
> - [bullet points]
>
> **What could be better:**
> - [bullet points]
>
> **Other observations:**
> - [bullet points]
>
> Does this capture what you wanted to share? I can adjust anything before sending."

### Phase 5: Submit via Google Form

Once they confirm, **open the form directly in their browser** using the Bash tool:

1. Construct the pre-filled URL with their feedback (URL-encoded)
2. Use Bash to open it:
   - On macOS: `open "URL"`
   - On Linux (Codespaces): `xdg-open "URL"`
   - Or try: `open "URL" 2>/dev/null || xdg-open "URL"`
3. Tell the user:

> "I've opened the feedback form in your browser. Just review it and click Submit. Remember—this is completely anonymous. Thanks for helping us improve!"

---

## Technical Setup: Google Form Configuration

**For course administrators:** You need to create a Google Form and configure this skill to use it.

### Step 1: Create the Google Form

1. Go to [Google Forms](https://forms.google.com) and create a new form
2. **Important:** Go to Settings (gear icon) and make sure "Collect email addresses" is OFF
3. Create these fields (all as "Long answer" type):
   - "What's working well?"
   - "What could be better?"
   - "Other observations"
4. Optional: Add a "How would you rate the course so far?" (1-5 scale)

### Step 2: Get the Pre-Fill URL Format

1. In your form, click the three-dot menu → "Get pre-filled link"
2. Fill in placeholder text in each field (e.g., "PLACEHOLDER1", "PLACEHOLDER2", "PLACEHOLDER3")
3. Click "Get link" and copy it
4. The URL will look something like:
   ```
   https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.111111111=PLACEHOLDER1&entry.222222222=PLACEHOLDER2&entry.333333333=PLACEHOLDER3
   ```

### Step 3: Configure This Skill

Replace the `GOOGLE_FORM_CONFIG` section below with your actual values:

```
GOOGLE_FORM_CONFIG:
  base_url: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?usp=pp_url"
  fields:
    working_well: "entry.111111111"
    could_be_better: "entry.222222222"
    other: "entry.333333333"
```

### Generating the Pre-Filled URL

When generating the link for the student, URL-encode their feedback and construct the URL:

```
{base_url}&{working_well}={encoded_feedback_1}&{could_be_better}={encoded_feedback_2}&{other}={encoded_feedback_3}
```

**Example constructed URL:**
```
https://docs.google.com/forms/d/e/ABC123/viewform?usp=pp_url&entry.111=The%20examples%20were%20great&entry.222=Pacing%20was%20too%20fast&entry.333=Loved%20the%20simulation%20exercise
```

---

## Current Configuration

**GOOGLE_FORM_CONFIG:**
```
base_url: "https://docs.google.com/forms/d/e/1FAIpQLSf3D72SoWySWFFmjJTNLJvZSsKRu-XaxnVCb7HkMZY8EOaC9A/viewform?usp=pp_url"
fields:
  working_well: "entry.525889371"
  could_be_better: "entry.866980772"
  other: "entry.926003003"
```

---

## Key Principles

1. **Emphasize anonymity** - Say it early and repeat it; students need to trust this
2. **Low pressure** - Make it clear any feedback is valuable, big or small
3. **Conversational** - This isn't a survey; ask follow-ups naturally
4. **Confirm before sending** - Show them what you captured so they can adjust
5. **Make submission easy** - Pre-filled link means one click to review and submit
