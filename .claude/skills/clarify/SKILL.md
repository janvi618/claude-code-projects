---
name: clarify
description: Structured discovery interview to understand a project or initiative deeply - both the substance (what you're proposing, what evidence you have, what gaps exist) and the politics (who decides, what drives them, how to navigate). Use when starting a new initiative, before planning, or when you need to think through both what you're trying to accomplish AND how to make it happen.
---

# Clarify

A structured discovery interview that helps you understand both the substance of what you're trying to do and the politics of making it happen.

## How It Works

1. Ask about document depth (fast vs. thorough)
2. Open with "What are you trying to accomplish?"
2. Follow user's thread with adaptive questions
3. Track checklist of areas to cover (visible to user)
4. Use multiple choice whenever possible for speed
5. Go deep on Stakes, Key People, AND Strength of Case
6. Produce clear report saved to docs/
7. Offer to trigger Battle Plan skill

## The Checklist

Track these areas. Show user what's covered vs. remaining.

### The Basics
| Area | Depth | What to Understand |
|------|-------|-------------------|
| **Goal** | Medium | What are you trying to accomplish? |
| **Success Criteria** | Deep | What does "done" look like? How will you know? |
| **Stakes** | Very Deep | Success AND failure. Company AND personal. |
| **Urgency** | Medium | Why now? Forcing function? Timeline? |

### The Substance
| Area | Depth | What to Understand |
|------|-------|-------------------|
| **Current Proposal/Plan** | Deep | What are you actually proposing? What's in it? |
| **Evidence You Have** | Deep | What data, examples, proof points exist today? |
| **Gaps & Weaknesses** | Very Deep | What's weak? What will opponents attack? What questions can't you answer? |
| **Research Needed** | Deep | What don't you know? Competitors? Industry? Frameworks? Experts? |

### The Politics
| Area | Depth | What to Understand |
|------|-------|-------------------|
| **Key People** | Very Deep | Who decides? Who influences? Drives, fears, hopes, stance for each. |
| **Constraints** | Medium | What's off the table? Non-negotiables? |
| **Context/History** | Medium | What's been tried? Backstory? Your track record here? |

## Questioning Approach

### First Question: Document Depth

Before diving in, ask:

```
Do you want fast or thorough document review?
A) Fast - use doc-summary/ (smaller files, quicker responses)
B) Thorough - use docs/ (full documents, more context)
C) Skip documents - just work from what I tell you
```

Based on answer, read from the appropriate folder when reviewing case materials.

### Then Start With
"What are you trying to accomplish?"

### Follow the Thread
Respond to what user says. Don't force linear progression. But track what's covered and gracefully bridge to uncovered areas.

### Multiple Choice Patterns

Use these whenever possible. Always include escape options.

**For Stakes - Company:**
```
If this fails, what's the impact on the company?
A) Minor setback - we try something else
B) Significant pain - wasted resources, lost time
C) Major damage - strategy derailed, competitive loss
D) Skip this / Move on
E) Let me just tell you in my own words
```

**For Stakes - Personal:**
```
If this succeeds, what does it mean for YOU?
A) Career advancement - visibility, promotion potential
B) Credibility - proves your judgment
C) Relief - solves a problem weighing on you
D) Influence - more say in future decisions
E) Multiple of the above
F) Skip this
G) Let me just tell you in my own words
```

**For Evidence Strength:**
```
How strong is your evidence today?
A) Rock solid - data, examples, external validation
B) Promising - good examples but gaps in data
C) Anecdotal - stories and intuition, limited hard proof
D) Weak - I'm mostly arguing from logic, not evidence
E) Let me just tell you in my own words
```

**For Proposal Weaknesses:**
```
What's the biggest weakness an opponent would attack?
A) Unclear ROI or success metrics
B) Lack of proof it will work
C) Cost or resource requirements
D) Risk or governance concerns
E) Multiple of the above (which?)
F) I'm not sure - help me think through this
G) Let me just tell you in my own words
```

**For Research Gaps:**
```
What do you NOT know that you probably should?
A) What competitors are doing
B) What best practices exist in other industries
C) What frameworks or experts say about this
D) What's been tried before (here or elsewhere)
E) Multiple of the above
F) I don't know what I don't know
G) Let me just tell you in my own words
```

**For Key Person Stance:**
```
How would you describe [Name]'s current position?
A) Actively supportive - championing this
B) Open but uncommitted - needs convincing
C) Skeptical - has concerns
D) Opposed - actively resistant
E) Unknown - not sure where they stand
F) Let me just tell you in my own words
```

**Note:** Always include an open-ended option. Users should feel free to ignore the multiple choice and just explain in their own words. The options are for speed, not constraint.

### Deepening Prompts

When answers are vague, probe deeper:
- "Can you give me a specific example?"
- "What would that actually look like?"
- "Say more about that."
- "What makes you say that?"
- "On a scale of 1-10, how confident are you in that?"
- "What would change your mind?"
- "If an opponent pushed back on that, what would they say?"

### Key People Deep Dive

For each key person mentioned, ask (with skip option each time):
1. What's their role in this decision?
2. What drives them? What do they care about?
3. What are they afraid of?
4. What are they hoping for?
5. Current stance: Supporter, Skeptic, Blocker, or Unknown?
6. What would move them?

### Evidence and Gaps Deep Dive

This is as important as key people. Ask:
1. What's your strongest piece of evidence this will work?
2. What data do you have? What data are you missing?
3. Are there examples - internal or external - that prove the concept?
4. What would a skeptic say is wrong with your proposal?
5. What questions can you not answer today?
6. What research would make your case dramatically stronger?

### Escape Hatches

Always honor:
- "Move on"
- "Skip"
- "That's enough on this"
- "Next topic"

## Output

Save ONE file to docs/ with two sections:

### File: `docs/clarify-[topic]-[YYYY-MM-DD].md`

```markdown
# Clarification: [Goal in plain language]
Generated: [date]

---

## The Quick Version

[4-6 paragraph direct, no-BS summary covering:
- What they're trying to do and why it matters
- The strength of their current case (evidence, gaps)
- The key people and political dynamics
- What needs to happen to succeed]

---

## Full Details

> **Note:** Leave this document in your project files. It helps the LLM understand the context for future planning and execution.

### Goal
[What they're trying to accomplish]

### Success Criteria
[Specific, testable outcomes]

### Stakes

**If this succeeds:**
- For the company: [specific impacts]
- For you personally: [specific impacts]

**If this fails:**
- For the company: [specific impacts]
- For you personally: [specific impacts]

### Urgency
- **Why now**: [forcing function]
- **Timeline**: [deadlines, windows]
- **Cost of delay**: [what happens if this slips]

---

### The Substance

#### Current Proposal/Plan
[What they're actually proposing - the key elements]

#### Evidence You Have
- [Data points]
- [Examples/proof points]
- [External validation if any]

#### Gaps & Weaknesses
- [What's weak in the current proposal]
- [Questions you can't answer]
- [What opponents will attack]

#### Research Needed
- [Competitive intel needed]
- [Industry/external benchmarks needed]
- [Frameworks or expert perspectives that would help]
- [Other unknowns to resolve]

---

### The Politics

#### Key People

##### [Person 1 Name]
- **Role**: [their role in this decision]
- **What drives them**: [motivations]
- **What they fear**: [concerns, risks they worry about]
- **What they hope for**: [desired outcomes]
- **Current stance**: [Supporter/Skeptic/Blocker/Unknown]
- **What would move them**: [leverage points]

##### [Person 2 Name]
[Same structure]

#### Constraints
- [What's off the table]
- [Non-negotiables]
- [Political limits]

#### Context & History
- [What's been tried before]
- [Relevant backstory]
- [Your track record on this topic]
```

## After Completion

Ask: "Want to create a Battle Plan from this?"

If yes, invoke the battle-plan skill.
