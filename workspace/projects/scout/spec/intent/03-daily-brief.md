# Daily Brief Generation & Delivery

## Purpose

At 6:30 AM CT on weekdays, synthesize the top-scored intelligence items from the past 24 hours into an executive-ready daily brief. Deliver via email and post to the web dashboard by 7:00 AM CT.

## Synthesis Pipeline

### Input Selection
Query intelligence_items where `processed_at` is within the last 24 hours and `relevance_score >= 50`. Order by relevance_score descending. Cap at 20 items maximum.

### Brief Generation (Claude Opus 4)
Send the selected items to Claude Opus with a synthesis prompt that produces the following structured brief:

**Lead Signal** (1 paragraph): The single most strategically important development. Frame it as an implication or question for General Mills, not just a fact. This should be the item the CIO reads even if they read nothing else.

**New Products & Innovation** (3-5 bullets): Competitor product launches, reformulations, packaging changes. Each bullet names the competitor, describes the action, and provides a one-sentence impact assessment relative to General Mills' portfolio.

**Technology & Digital** (2-3 bullets): AI adoption, digital commerce, supply chain tech, food tech innovation. Frame in context of the CAGNY 2026 AI divergence — which competitors are advancing vs. falling behind on AI integration.

**Science & Trends** (1-2 bullets): Only if significant research was published. Tie findings to General Mills' three innovation priorities. Omit this section entirely if no relevant science items exist.

**Worth Watching** (2-3 bullets): Emerging signals that don't yet warrant a full section. Startup funding, regulatory developments, disruptor brands.

### Formatting Rules
- Total brief: 400-700 words maximum. Executives scan, they don't read.
- Every factual claim must reference a specific source item from the input.
- Use active voice. Lead with the action, not the company.
- No marketing language or hedge words. Be direct about competitive implications.
- If fewer than 5 relevant items exist in a 24-hour window, generate a shorter brief and note the quiet period.

### Brief Data Model
```
daily_briefs:
  id: UUID (PK)
  brief_date: DATE (unique)
  content_html: TEXT (rendered HTML)
  content_text: TEXT (plain text for email)
  item_ids: JSONB (array of intelligence_item UUIDs used)
  word_count: INTEGER
  generated_at: TIMESTAMP
  delivered_at: TIMESTAMP (null until email sent)
  model_used: VARCHAR(100)
  token_count_input: INTEGER
  token_count_output: INTEGER
```

## Email Delivery

Use the Resend API to send the brief as an HTML email. Send to all users with `receive_brief = true` in their user record. Subject line format: `SCOUT Daily Brief | {weekday}, {month} {day}`. From address: `scout@{configured-domain}`. Include a "View in Dashboard" link.

## Scheduling

- 6:30 AM CT: Brief generation begins
- 6:35 AM CT (estimated): Brief saved to database, posted to dashboard
- 6:40 AM CT: Email delivery begins
- 7:00 AM CT: Target arrival time in inboxes

If generation fails (LLM error, insufficient items), log the error and retry once at 6:45 AM. If the retry fails, send a fallback email: "SCOUT brief generation failed for {date}. View raw intelligence feed at {dashboard-url}."

## Weekend/Holiday Behavior

No brief is generated on Saturdays and Sundays. On Mondays, the brief covers Friday evening through Monday morning (approximately 60 hours of intelligence).
