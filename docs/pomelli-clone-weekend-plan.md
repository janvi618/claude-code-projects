# Project: "Pomelli Clone" — Built with Kilroy + the StrongDM Software Factory Method

## The Pitch to Your CIO (In One Sentence)

"Our Feature Capabilities team used Kilroy — an open-source implementation of StrongDM's Software Factory — to orchestrate AI coding agents through a DOT-defined pipeline that built a working Pomelli-style marketing tool, with automated convergence and no hand-written code."

That sentence layers three wow-moments: the *product* (Pomelli clone), the *method* (Software Factory), and the *tooling* (Kilroy pipeline automation). Most teams are still in "copilot autocomplete" mode — you're showing Level 5 on Dan Shapiro's taxonomy.

---

## What's Changed: Kilroy as the Orchestration Layer

In the previous version of this plan, you were the manual orchestrator — feeding specs to Claude Code one at a time, eyeballing results, re-running. That works, but it's Level 4 on Shapiro's scale ("human supervising agents").

With Kilroy, you define the entire build-test-refine workflow as a **Graphviz DOT pipeline**, and Kilroy executes it node-by-node using coding agents. It checkpoints after every stage (as git commits), so you can resume, audit, and replay. This is Level 5 — the Dark Factory.

### What is Kilroy?

Kilroy is Dan Shapiro's Go CLI that implements StrongDM's Attractor pattern. In practical terms:

- **`kilroy attractor ingest`** — takes English requirements and generates a DOT pipeline graph
- **`kilroy attractor validate`** — checks that the DOT graph is structurally valid
- **`kilroy attractor run`** — executes the pipeline node-by-node with coding agents (Claude Code, Codex, or Gemini CLI as backends), checkpointing via git commits after each stage
- **`kilroy attractor resume`** — picks up where it left off if a run is interrupted

The pipeline is a directed graph where nodes are tasks (implement, test, review) and edges are control flow (pass → next stage, fail → loop back). Different models can be used for different nodes — a reasoning-heavy model for architecture, a fast model for boilerplate.

Kilroy is early-stage (alpha/beta), actively developed, and built on top of StrongDM's open Attractor spec. It also integrates with CXDB (StrongDM's context database) for run history and observability, though CXDB is optional.

---

## Architecture Overview

```
You (spec author & scenario evaluator)
  │
  ├── Write specs (brand-dna-extractor.md, campaign-generator.md, app.md)
  ├── Write scenarios (holdout set — Kilroy never sees these)
  ├── Author the DOT pipeline (pomelli-pipeline.dot)
  └── Configure Kilroy (run.yaml)
         │
         ▼
┌─────────────────────────────────────────────┐
│  Kilroy CLI                                 │
│                                             │
│  pomelli-pipeline.dot                       │
│  ┌──────┐   ┌───────────┐   ┌──────────┐   │
│  │start │──▶│ implement  │──▶│  test    │   │
│  └──────┘   │ extractor  │   │ extractor│   │
│             └───────────┘   └────┬─────┘   │
│                                  │          │
│                    ┌─────────────┤          │
│                    │pass         │fail      │
│                    ▼             ▼          │
│             ┌───────────┐  (loop back)      │
│             │ implement  │                  │
│             │ generator  │──▶ test ──▶ ...  │
│             └───────────┘                   │
│                    │                        │
│                    ▼                        │
│             ┌───────────┐                   │
│             │ implement  │                  │
│             │   app      │──▶ test ──▶ exit │
│             └───────────┘                   │
│                                             │
│  Backend: Claude Code / Codex / Gemini CLI  │
│  Checkpoints: git commits per stage         │
└─────────────────────────────────────────────┘
         │
         ▼
You run scenarios against the output manually
         │
         ▼
If satisfaction < 70%: update specs, re-run Kilroy
```

---

## Your Tools and How They Map

| Tool | Role |
|------|------|
| **Kilroy** | Pipeline orchestrator — the "factory floor manager" that runs the DOT graph |
| **Claude Code** | Primary coding agent backend — Kilroy spawns it for each codergen node |
| **GitHub Codespaces** | Runtime environment where Kilroy and agents execute |
| **Gemini CLI** | Alternative backend (Kilroy supports swapping models per node) |
| **Codex** | Alternative backend, especially strong for certain code generation tasks |
| **Claude (this chat)** | Spec writing partner, DOT pipeline designer, scenario evaluator |

---

## Weekend 1: Specs + Pipeline + First Kilroy Run

### Saturday Morning (3–4 hours): Install Kilroy + Write Specs

**Set up Kilroy:**
```bash
# In your GitHub Codespace or local machine
# Kilroy is a Go binary
git clone https://github.com/danshapiro/kilroy.git
cd kilroy
go build -o kilroy ./cmd/kilroy

# Verify it works
./kilroy attractor --help
```

**Set up API keys:**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
# Optionally: export OPENAI_API_KEY=... for Codex backend
# Optionally: export GOOGLE_API_KEY=... for Gemini backend
```

**Write the three spec files** (provided in this package):
- `specs/brand-dna-extractor.md`
- `specs/campaign-generator.md`
- `specs/pomelli-clone-app.md`

**Write the scenario holdout set** (also provided):
- Keep `scenarios/` outside the repo or `.gitignore` it — Kilroy and the agents must never see these.

### Saturday Afternoon (3–4 hours): Author the DOT Pipeline + run.yaml

This is the key Kilroy-specific work. You define the build workflow as a Graphviz DOT graph.

**Create `pomelli-pipeline.dot`** (provided in this package — see the pipeline spec file).

**Create `run.yaml`** (provided — see the Kilroy config file).

Then validate:
```bash
./kilroy attractor validate --graph pomelli-pipeline.dot
```

### Sunday (6–8 hours): First Kilroy Run + Iteration

```bash
# Run the full pipeline
./kilroy attractor run --graph pomelli-pipeline.dot --config run.yaml

# Kilroy will:
# 1. Execute the "implement_extractor" node (spawns Claude Code with your spec)
# 2. Checkpoint (git commit)
# 3. Execute "test_extractor" (runs the code, checks Definition of Done)
# 4. If tests fail → loops back to implement_extractor with error context
# 5. If tests pass → moves to implement_generator
# 6. ... and so on through the full pipeline
```

**Watch it work.** Kilroy emits events as it runs — you'll see each stage start, the agent working, checkpoints being saved.

**If it stalls or fails:**
```bash
# Check status
./kilroy attractor status --logs-root ./logs

# Resume from last checkpoint
./kilroy attractor resume --logs-root ./logs
```

After the first run completes, **run your scenarios manually** against the output. Score them. Note what failed.

---

## Weekend 2: Convergence + Demo Polish

### Saturday (6–8 hours): Spec Refinement + Re-Run

For each failing scenario:
1. Identify what the *spec* was missing
2. Update the spec
3. Re-run Kilroy: `./kilroy attractor run --graph pomelli-pipeline.dot --config run.yaml`

You can also refine the DOT pipeline itself — add more specific prompts to nodes, increase `max_agent_turns` on tricky nodes, or add a dedicated "polish_ui" stage.

**Track convergence:** After each Kilroy run, record your scenario satisfaction scores. You want to show the CIO a chart: "Run 1: 35%, Run 2: 55%, Run 3: 72%" — all achieved by refining specs, not touching code.

### Sunday (4–6 hours): Demo Preparation

**Build a 12-minute CIO demo with four acts:**

**Act 1 — The Landscape (2 min):**
"AI coding is moving beyond copilot autocomplete. StrongDM has a 3-person team shipping production security software where no human writes or reviews code. Dan Shapiro created a taxonomy of 5 levels of AI coding adoption. Most teams are at Level 2-3. We're going to show you Level 5."

**Act 2 — The Method (3 min):**
Show the DOT pipeline visualization (render it with Graphviz — it produces a beautiful flowchart). Explain: "This is our build pipeline. Each node is a stage executed by an AI coding agent. Kilroy orchestrates the whole thing. The arrows show control flow — if a test fails, it loops back and tries again. We don't touch the code."

**Act 3 — The Convergence Story (3 min):**
Show specs → show scenario satisfaction scores across runs → show git log (each Kilroy checkpoint is a commit with a message). "We went from 35% scenario satisfaction to 78% across four pipeline runs. The only human work was refining the specs."

**Act 4 — The Product (4 min):**
Live demo the Pomelli Clone. Enter a bakery URL → Brand DNA card → campaigns. Enter a law firm URL → different Brand DNA → different campaigns. The contrast sells itself.

---

## Risk Mitigation (Updated for Kilroy)

| Risk | Mitigation |
|------|-----------|
| Kilroy is alpha-stage and might have bugs | Budget 2-3 hours on Saturday morning for setup troubleshooting. Have the manual Claude Code approach as your fallback — the specs work either way. |
| Go build fails in Codespaces | Pre-build the binary locally and scp it, or use `go install` |
| CXDB setup is complex | CXDB is optional. Skip it for now — Kilroy works with just git checkpoints. You can mention CXDB as a "next step" in the CIO presentation. |
| Pipeline gets stuck in a loop | Set `max_agent_turns` on nodes (300 is the default). If a node can't converge, Kilroy will move on. You can also use `--force-model` to try a different model. |
| Two weekends isn't enough for Kilroy + Pomelli Clone | Your fallback is: use Kilroy for just the extractor module (the most impressive piece), and build the rest manually. Show Kilroy as the method demo and the working app as the product demo. |

---

## What Makes This CIO-Ready (Updated)

You're showing **four layers** simultaneously:

1. **AI Product Vision:** "Here's the kind of AI-powered capability we could build for customers" (the Pomelli clone)
2. **AI Development Method:** "Here's the Software Factory approach, proven by StrongDM" (specs + scenarios + satisfaction)
3. **AI Orchestration Tooling:** "Here's Kilroy, running our pipeline automatically with checkpointing, convergence detection, and multi-model support" (the DOT graph + execution)
4. **Team Capability:** "We did this in two weekends with tools we already have access to" (proof it's real)

The Kilroy layer is what elevates this from "we used Claude Code to build something" (which every team can claim) to "we built an automated software factory pipeline" (which almost no one is doing yet).

---

## File Inventory

| File | Description |
|------|-------------|
| `specs/brand-dna-extractor.md` | NLSpec for the website analysis module |
| `specs/campaign-generator.md` | NLSpec for the AI campaign generation module |
| `specs/pomelli-clone-app.md` | NLSpec for the web UI |
| `scenarios/scenarios.md` | Holdout validation scenarios (keep away from agents) |
| `pomelli-pipeline.dot` | The Kilroy Attractor pipeline graph |
| `run.yaml` | Kilroy run configuration |
| `README.md` | How to use this spec package |
