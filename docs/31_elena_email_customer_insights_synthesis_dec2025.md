# EMAIL

**From:** Elena Vasquez <evasquez@meridian.com>
**To:** Jordan Torres <jtorres@meridian.com>
**CC:** Ray Okonkwo <rokonkwo@meridian.com>
**Date:** December 3, 2025 4:32 PM
**Subject:** I found three problems nobody knew we had

---

Jordan, Ray,

I want to share something I've been doing quietly for the past few months. I think it shows what's possible—and also what's broken about how we learn from our customers.

Quick background: I'm a Product Manager for the FastTrack fulfillment line, been at Meridian about three years. My job is to figure out what customers need and translate that into product decisions.

Here's the problem: the information I need exists, but it's scattered across groups that don't talk to each other.

---

## The data silos

**Customer Service** has call logs and complaint tickets. They track what customers are unhappy about in the moment—but that data stays in CS. It feeds their metrics, their coaching, their process improvements. It rarely makes it to Product unless someone escalates.

**IT Support** has technical tickets from customers having integration problems, system errors, API issues. That data stays in IT. They fix the immediate problem and close the ticket. The patterns—which integrations fail most, which customers have recurring issues—aren't visible to anyone outside IT.

**Sales** has field notes. Every rep hears things from customers: feature requests, competitor comparisons, frustrations, wishes. Some of it goes into CRM. Most of it lives in email threads, personal notes, or just in people's heads. It's never aggregated.

**Product** (my team) does formal customer research. Quarterly surveys. Annual NPS. Occasional user interviews. By the time we see trends, they're already six months old.

So we have four groups, all collecting customer intelligence, none of it connected.

---

## What I built

I started asking people for data exports. Anonymized complaint tickets from CS. IT ticket summaries (no PII). Sales call notes from a few reps I know well. Survey verbatims from our research archive.

I fed it all into Claude.

Not asking it to "analyze customer feedback." That's too vague. I asked specific questions:

- "What problems appear in multiple data sources but might not be obvious if you only looked at one?"
- "What are customers asking for that they're not getting? Look for patterns in requests, complaints, and workarounds."
- "What correlations do you see between IT issues and customer satisfaction signals?"

---

## What I found

**Finding #1: The packaging problem no one escalated**

CS tickets showed a pattern: customers receiving damaged ProGuard safety equipment. Not a lot—maybe 2-3% of orders. Each ticket was handled individually. Refund, replacement, apology.

But when I looked at IT data, I found something connected: the same customers were also having trouble with our online reorder system. Weird, right? Unrelated systems.

Turns out: when packages arrived damaged, customers would photograph them for the claim. Many were taking photos of the *shipping label*—which included a barcode. They'd then try to reorder using a barcode scanner app, which was inputting corrupted data into our system.

The packaging damage was causing both problems. But CS saw "damaged shipments" and IT saw "data entry errors." Nobody connected them because they were in different systems with different owners.

We changed the packaging. Damage rate dropped. And mysteriously, so did the "data entry errors."

**Impact:** Return rate on ProGuard line down 23%. Estimated annual savings: $180K in returns processing plus unquantified customer goodwill.

---

**Finding #2: The silent integration failure**

IT tickets showed a subset of customers having recurring errors with our EDI integration—specifically, order confirmations weren't transmitting correctly. Each time, IT would "resolve" the ticket by manually pushing the confirmation.

What IT didn't see: the same customers appeared in Sales notes with comments like "customer frustrated about order visibility" and "says they never know when shipments are confirmed."

And in CS data: those same accounts had higher-than-average call volume asking "did you receive my order?"

This wasn't a series of individual glitches. It was a systematic integration bug affecting customers using a specific version of SAP. It had been failing silently for *eighteen months*, generating hundreds of support contacts across three departments, and nobody connected the dots because each department was looking at their own slice.

Engineering found and fixed the bug in two weeks once they knew to look.

**Impact:** Estimated $200K/year in order correction costs and support overhead. Plus we nearly lost two accounts worth $1.4M combined.

---

**Finding #3: The feature we didn't know customers wanted**

This one came from Sales notes. Multiple reps, different regions, similar comments:
- "Customer asked if we do vendor-managed inventory"
- "Lost deal to Grainger—they offered consignment"
- "Prospect wanted us to manage their stockroom"

None of these made it to Product as a formal feature request. They were just notes in a CRM.

But when I combined Sales notes with CS calls, I found customers asking how to set up "automatic reordering" and whether we could "just handle it for them."

And in the survey verbatims, phrases like: "I wish I didn't have to think about ordering—I just want the stuff to be there."

This isn't a feature request. It's a *job to be done* that nobody had articulated because the signals were scattered.

I brought this to the roadmap committee. We fast-tracked a managed inventory pilot for enterprise accounts. It landed a $2.1M account in Q4 that had been stuck in the pipeline for 11 months. They said the managed inventory option was the deciding factor.

---

## The real problem

Here's what bothers me:

All of this information existed. It was in our systems. Real employees were looking at it every day. But nobody could see the pattern because:

1. Each department is measured on their own metrics, not on surfacing insights for others
2. There's no process for cross-functional data synthesis
3. The systems don't talk to each other
4. Even if someone wanted to connect the dots, they'd have to manually pull data from five different sources and somehow analyze it together

I did this with copy-paste and an AI tool on my personal laptop. It took me about 10 hours over a few weeks. I found $400K+ in direct impact, saved two major accounts, and informed a roadmap decision that closed a $2M deal.

What else is hiding in our data that we can't see?

---

## What I need

I can't keep doing this manually. I need:

1. **Access:** A sanctioned way to pull data from CS, IT, Sales, and Research without begging each team individually
2. **Tools:** An AI environment where I can do this analysis without worrying about compliance (I've been very careful with PII, but I shouldn't have to be a one-person privacy department)
3. **Process:** A regular cadence for cross-functional insight sharing, not just my ad-hoc detective work

I've talked to my manager (Ray, cc'd). He's supportive but doesn't have budget for a "cross-functional AI analytics initiative." That's apparently a different department's problem.

---

Jordan, I heard you're working on an AI Lab proposal. This seems like exactly the kind of thing that would fit. Not replacing anyone's job—CS, IT, Sales, and Product all still need to do what they do. But connecting the dots in a way that no individual team can.

Happy to share more details, walk you through my process, whatever's useful. Just let me know.

Elena

---

**P.S.** — I've been thinking about what other patterns might be hiding. What if we could correlate customer complaints with *weather* data? (We have outdoor equipment customers whose orders spike before storms.) What if we could predict which customers are about to churn based on subtle signals across all these channels? I've got a list of hypotheses I'd love to test. Just need a way to do it that doesn't require me to be a rogue data analyst in my spare time.
