---
name: executive-persuasion
description: Create a persuasion strategy based on Cialdini's six principles of influence. Use after /clarify when you need to persuade someone.
---

# Executive Persuasion

Create a customized persuasion strategy based on Cialdini's principles.

## Usage

```
/executive-persuasion
```

## Where This Fits

```
/clarify → /executive-persuasion → /battle-plan
```

Run after `/clarify` when your goal involves persuading someone. The blueprint feeds into `/battle-plan` for execution sequencing.

## What This Does

Uses Cialdini's six principles of influence to create a persuasion strategy:

- **Reciprocity** - Provide value before asking
- **Commitment** - Get small yeses before big yeses
- **Social Proof** - Show what peers and competitors do
- **Liking** - Build genuine connection
- **Authority** - Establish credibility through candor
- **Scarcity** - Frame loss, not just gain

## How It Works

1. Pulls context from any `/clarify` output
2. Assesses which principles fit your situation
3. Rates each principle (Strong/Moderate/Weak)
4. Generates a phased blueprint with action checkboxes

## Output

Saves a persuasion blueprint to `docs/` with:
- Principle assessment summary
- Pre-work actions by principle
- Opening, core message, and closing strategy
- Objection preparation
- Checkboxes for execution

$ARGUMENTS
None
