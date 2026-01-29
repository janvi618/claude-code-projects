# Simulate: Create Your Personalized Learning Scenario

This skill guides users through creating a simulated company environment that mirrors their real work challenges—without using any actual confidential data.

## Purpose

Many executives can't enter real company data into AI tools due to confidentiality. This skill creates a realistic fictional scenario based on their actual work context, generating 30+ documents (memos, emails, CSVs, Slack messages, reports) they can use for hands-on practice.

## Invocation

- `/simulate` - Start creating a new simulation or modify an existing one

## Workflow

### Phase 1: Check for Existing Simulation

First, check if `workspace/projects/` contains any previous simulation folders (folders starting with `simulation-`).

If previous simulations exist:
- List them with their dates
- Ask: "I see you have an existing simulation. Would you like to start fresh or modify the existing one?"

### Phase 2: Open-Ended Discovery

This phase should feel like a natural conversation, not a survey. Start with open-ended questions and let the user share in their own words. Only use multiple-choice later to fill specific gaps.

#### 2.1 About You and Your Company

Start with this open-ended prompt:

> "Let's create a simulation that feels relevant to your real work. Please tell me a bit about yourself—your title and role, where you work. You don't have to share the actual company name, but things like:
> - What industry you're in
> - Rough size and scope of the company
> - What markets or customers you serve
>
> If you don't feel comfortable sharing specific details, feel free to make them up. But make sure to make up something that will still create a meaningful simulation for you."

**Wait for their response.** Then briefly acknowledge what they shared before moving on.

#### 2.2 A Specific Project

Next, ask about their work:

> "Thanks for that context. Now, what's a specific project you're working on right now—or one you're likely to work on soon?
>
> No need to share anything that would give away who you work for or any proprietary information. We're just trying to simulate something close enough that the exercises in this class will be meaningful for you.
>
> Feel free to make up details. Just tell me—with as much detail as you're comfortable with—about a project."

**Wait for their response.**

#### 2.3 Tailored Follow-Ups

Based on what they described, ask **open-ended follow-up questions** that are relevant to their specific project. These should dig deeper while always reassuring them they don't need to share identifiable details.

**Examples of tailored follow-ups:**

If they need to **persuade or influence leaders**:
> "You mentioned needing to get buy-in from leadership. Tell me a bit about those leaders—not names or anything identifiable, but:
> - What are their roles?
> - What do they care about most?
> - What might make them skeptical or resistant?
>
> I'll make up the specific people, but understanding the dynamics will help make the simulation realistic."

If they need to **produce technical work**:
> "You mentioned some technical aspects. Can you tell me more about the technical environment—what systems, tools, or infrastructure are involved?
>
> No need for specific vendor names or proprietary details. I'll fill those in. I just want to get close enough that it feels realistic to you."

If they're dealing with **organizational complexity**:
> "It sounds like there are multiple stakeholders involved. Can you sketch out the landscape for me?
> - Who's supportive vs. skeptical?
> - Are there competing priorities or political dynamics?
> - Any external parties like vendors, consultants, or board members?"

If they're working on **data or metrics**:
> "You mentioned some data/metrics aspects. What kinds of numbers or KPIs matter for this project?
> - What would success look like?
> - What data do people look at to make decisions?
>
> I'll generate realistic fictional data, but I want it to match the shape of what you actually work with."

**Keep asking follow-ups** until you have a clear picture of:
- The project goal and what success looks like
- The key people involved and their perspectives
- The challenges or obstacles they face
- The types of information and documents that matter

### Phase 3: Confirm and Fill Gaps (Multiple-Choice Only Where Needed)

Now review what you've learned. For anything that's **already clear**, don't ask again—just confirm:

> "Based on what you've told me, here's what I'm thinking for the simulation:
> - **Industry**: [what they indicated]
> - **Company size**: [your inference]
> - **Your role**: [similar fictional title]
> - **The challenge**: [summary of their project]
>
> Does that sound right?"

For anything that's **still unclear**, ask a targeted question. Frame it conversationally:

**Industry** (if unclear):
> "It sounds like you work in [industry]. Do you want us to use that for the simulation? Or would you prefer a similar industry—like [option 1] or [option 2]—just to keep things a bit more opaque?"

**Company size** (if unclear):
> "I want to get the company size right for the simulation. Roughly how big is the organization?
> - Under $500M revenue / under 2,000 employees
> - $500M - $5B / 2,000 - 20,000 employees
> - $5B+ / 20,000+ employees
> - Or tell me the rough size"

**Urgency** (if unclear):
> "You've told me about the project, but I'm not quite sure how pressing it is. Would you say it's:
> - Crisis mode—needs resolution now
> - Urgent—top priority this quarter
> - Important but not pressing—strategic initiative with runway
> - Routine—normal course of business"

**The people** (if you need more):
> "I want to populate the simulation with realistic characters. A few more questions about the key players:
> - Who do you report to on this?
> - Who reports to you?
> - Any important skeptics or champions I should include?"

### Phase 4: Company Naming

Once you have the full picture, offer to name the fictional company:

> "Let's name your fictional company. Based on [industry], here are some options:
> - [Contextually appropriate name 1]
> - [Contextually appropriate name 2]
> - [Contextually appropriate name 3]
> - Or name it yourself"

### Phase 5: Document Types

Ask what kinds of documents would make the simulation most useful:

> "What kinds of documents and communications typically show up in work like this? I'll generate a realistic set. Check all that apply:"

Use a multi-select question with options like:
- Email threads
- Slack/Teams messages
- Executive memos
- Meeting notes
- Financial reports / spreadsheets
- Project status updates
- Strategic plans / presentations
- Vendor proposals
- Customer feedback / survey results
- Or describe other types

### Phase 6: Sample Generation & Validation

Before generating the full set:

1. Generate 2-3 sample documents based on everything you've learned
2. Show them to the user
3. Ask: "Do these feel realistic? Should I adjust the tone, level of detail, or focus?"

Iterate until they confirm the direction is right.

### Phase 7: Full Document Generation

Generate 30+ documents (or more if the scenario warrants). Include a realistic mix based on their preferences.

**Suggested distribution** (adjust based on their input):
- 5-8 email threads (varying lengths, different senders)
- 3-5 Slack/Teams conversation excerpts
- 2-3 executive memos
- 2-3 meeting notes
- 3-5 CSV data files (metrics, KPIs, survey results, etc.)
- 2-3 reports or presentations
- 2-3 project updates or status reports
- Additional documents specific to their challenge

**File organization**:
Create a dated folder: `workspace/projects/simulation-YYYY-MM-DD/`

Inside, organize by type:
```
simulation-YYYY-MM-DD/
├── PERSONA.md          # Their fictional identity and assignment
├── emails/
├── slack/
├── memos/
├── reports/
├── data/
├── meetings/
└── other/
```

### Phase 8: Create the Persona Card

Create `PERSONA.md` with this structure:

```markdown
# Your Simulation Persona

## You Are:
**[Fictional Name]**, [Fictional Title] at **[Company Name]**

[Brief bio that mirrors their real role without identifying details]

## Your Company:
[Company Name] is a [size] [industry] company with [X] employees and approximately $[Y] in annual revenue.

[2-3 sentences about the company that make it feel real]

## Your Assignment:
[Clear description of the challenge they need to tackle, written as if it's their actual job assignment]

## Key Players:
- **[Name]** - [Role] - [Brief description and perspective]
- **[Name]** - [Role] - [Brief description and perspective]
[etc.]

## Available Documents:
Your `simulation-YYYY-MM-DD/` folder contains [X] documents including:
- [Summary of what's included]

## Getting Started:
1. Review the documents in your simulation folder
2. Ask Claude to help you tackle your assignment
3. Practice the skills you're learning with realistic context

---
*This simulation was created on [date]. To create a new simulation, run `/simulate` again.*
```

### Phase 9: Activate as Practice Scenario

After generating the documents, offer to make this the active practice scenario:

> "I've created your simulation. Would you like to make this your **active practice scenario**?"
>
> This means when you do exercises, they'll use your simulation instead of the default Meridian case study.

Use AskUserQuestion with options:
- **Yes, activate it** - I want to practice with my simulation
- **No, keep Meridian** - I'll stick with the default case study for now

**If they choose Yes:**

Update the `practice/` symlink to point to the new simulation:

```bash
# Remove old symlink
rm practice

# Create new symlink to the simulation
ln -s workspace/projects/simulation-YYYY-MM-DD practice
```

Confirm:
> "Done! Your `practice/` folder now points to your simulation. All exercises will use your custom scenario."

**If they choose No:**

> "No problem! Your simulation is saved at `workspace/projects/simulation-YYYY-MM-DD/`. You can activate it anytime by running `/set-scenario`."

### Phase 10: Wrap-Up

After the activation choice:

1. Explain what was created and where to find it
2. Show them how to view the PERSONA.md file:
   > "To see your persona and assignment, you can ask me to 'show my persona' or open the file at `workspace/projects/simulation-YYYY-MM-DD/PERSONA.md`"
3. Remind them about switching:
   > "To switch between your simulation and Meridian anytime, run `/set-scenario`."
4. Suggest next steps:
   > "You can now use these documents to practice with Claude. Try asking me to help you with your assignment, analyze the data, draft responses to emails, or prepare for meetings."

## Key Principles

1. **Start open-ended, narrow later** - Let them tell their story first; only use multiple-choice to fill gaps
2. **Make it conversational** - This should feel like an interview, not a survey
3. **Always offer an escape hatch** - They can make things up, skip details, or stay vague
4. **Tailor your follow-ups** - Ask questions relevant to their specific situation
5. **Validate with samples** - Show examples before generating everything
6. **Keep it fictional** - Never use real names, real company names, or identifiable details
7. **Explain everything** - This user is learning; be verbose about what you're doing and why
