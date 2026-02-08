# STAR PERFORMER PROJECT SUMMARIES (continued)

---

## Annette Cho  
**Role:** Legal Operations Manager  
**Years at Meridian:** 7  
**Project:** Contract Review Accelerator

### What She Built

Meridian reviews ~200 vendor contracts per quarter. Each one goes through a checklist: liability caps, termination clauses, IP provisions, insurance requirements. It's essential work, but it's slow—each contract takes 4-6 hours of attorney time.

Annette built a preprocessing system:
1. Upload contract PDF to Claude (via personal subscription)
2. Run standard prompt: "Review against Meridian's contract checklist" (which she refined over months)
3. Get back a structured analysis of key clauses, potential issues, and comparison to our standards
4. Attorneys review the AI analysis instead of reading from scratch

### Results
- Contract review time reduced by approximately 50%
- Attorneys report they catch more issues because they're reviewing analysis, not just reading
- Two problematic clauses caught in the past quarter that might have been missed under time pressure

### Her Take
"Judith [Abramowitz] knows I'm doing this. She hasn't told me to stop, but she hasn't officially approved it either. We're in this gray zone where results matter but process doesn't exist. That's not sustainable for Legal of all places."

### Risk Note
Contracts contain sensitive business terms. Annette believes she's compliant with our data policies but there's no verification. She's created value while creating risk. The Lab would solve this by providing governed access.

---

## Trevor Fong
**Role:** Customer Insights Analyst  
**Years at Meridian:** 4  
**Project:** Voice of Customer Synthesizer

### What He Built

Customer feedback comes from everywhere: NPS surveys, support tickets, sales call notes, social mentions, review sites. Synthesizing it into actionable insight was a quarterly project that took two weeks.

Trevor built an automated pipeline:
1. Aggregate feedback from all sources into a single format
2. Feed batches to Claude with consistent analytical prompts
3. Generate weekly synthesis: themes, emerging issues, sentiment trends
4. Auto-flag urgent issues for immediate attention

### Results
- Identified a product quality issue 3 weeks before it would have surfaced through normal channels
- Product team now plans sprints around the weekly synthesis
- Reduced quarterly synthesis project to essentially zero (it happens weekly now)

### His Take
"The customer insights pilot is the one that actually got approved. But the official version with EnterpriseAI.ai doesn't work nearly as well as what I built with Claude. So now I run both—the official one for the reports, my real one for actual insights. That's kind of insane."

### Manager Note
"Trevor's work has fundamentally changed how we hear the customer voice. The gap between what he can do and what we've officially approved is embarrassing." — Patricia Nwosu, Director of Customer Experience

---

## Reggie Cartwright
**Role:** R&D Project Manager  
**Years at Meridian:** 9  
**Project:** Patent Landscape Navigator

### What He Built

Before starting a new product development effort, R&D needs to understand the patent landscape: What's already protected? Where's the white space? What's the infringement risk?

This used to mean hiring external patent consultants ($15-30K per landscape analysis) and waiting 4-6 weeks.

Reggie built an internal capability:
1. Gather relevant patents from public databases
2. Feed them to Claude with product concept description
3. Generate preliminary landscape map: key patents, potential conflicts, white space opportunities
4. Use output to brief patent attorneys on where to focus deep analysis

### Results
- Reduced patent landscape analysis cost by ~60% (consultants now validate AI analysis rather than start from scratch)
- Accelerated timeline from 6 weeks to 2 weeks
- Three product concepts pivoted early based on patent landscape insights

### His Take
"I presented this to Vikram's team and they were enthusiastic but then asked me to 'wait for the official process.' That was five months ago. I'm still just doing it on my own."

### Technical Note
Reggie uses Claude's long context window to process multiple patents simultaneously. EnterpriseAI.ai can't handle documents of this length or complexity. The capability gap is fundamental, not marginal.

---

*Compiled by Jordan Torres, September 2025*
