---
name: timeline-generator
description: Generates a chronological timeline of key events, decisions, and flashpoints from a collection of documents. Use when asked to create a timeline, understand sequence of events, see what happened when, or track how a situation evolved over time.
---

# Timeline Generator

Extracts dates and events from documents to create a chronological narrative.

## When to Use

- User asks for a "timeline" of events
- User wants to understand "what happened when"
- User needs to see the sequence of decisions
- User wants to track evolution of a project or situation

## Instructions

### Phase 1: Extract Dates and Events

1. **Scan all documents** in the target folder
2. **For each document**, extract:
   - Explicit dates mentioned
   - Implicit timing ("last month", "Q2", "after the rollout")
   - What happened at each date point
   - Who was involved
   - Significance

3. **Categorize events** by type:
   - 📢 **Announcements/Decisions**
   - 🚀 **Launches/Deployments**
   - ⚠️ **Problems/Concerns**
   - 💡 **Proposals/Ideas**
   - 📊 **Metrics/Results**
   - 🔄 **Pivots/Changes**
   - 👥 **People Events**

### Phase 2: Build the Timeline

1. **Sort chronologically**
2. **Identify turning points** - moments where direction changed
3. **Note gaps** - periods with no documented activity
4. **Connect cause and effect** - what led to what

## Output Format

```markdown
# Timeline: [Topic]

## Chronological Events

### [Year or Quarter]

| Date | Event | Type | Source |
|------|-------|------|--------|
| Jan 2025 | CEO announces AI initiative at Davos | 📢 | carla_post_davos_memo |
| Mar 2025 | EnterpriseAI rollout begins | 🚀 | enterpriseai_rollout |

### [Next Period]
...

## Turning Points

1. **[Date]: [Event]**
   - What changed: [description]
   - Triggered by: [cause]
   - Led to: [consequence]

## Patterns Observed

- [Pattern 1]
- [Pattern 2]

## Gaps in the Record

- [Period with no documentation]
- [Questions about what happened between X and Y]
```

## Tips

- Pay attention to the time between events—sometimes silence is significant
- Look for accelerations (things happening faster) or decelerations
- Note when the same person appears at multiple turning points
- Watch for events that happened simultaneously but might be connected
