# Pomelli Clone — Spec Package (Kilroy Edition)

## What This Is

A complete spec package for building a Pomelli-style AI marketing tool using **Kilroy** (Dan Shapiro's Go implementation of StrongDM's Attractor pattern) as the pipeline orchestrator.

You write specs and scenarios. Kilroy runs a DOT-defined pipeline of coding agents that build the app. You evaluate scenarios against the output. When things fail, you update specs and re-run the pipeline — not the code.

## Files

| File | Purpose | Who uses it |
|------|---------|-------------|
| **Specs (agent-facing)** | | |
| `brand-dna-extractor.md` | NLSpec for the website → brand profile module | Kilroy (fed to agents at codergen nodes) |
| `campaign-generator.md` | NLSpec for brand → campaigns module | Kilroy |
| `pomelli-clone-app.md` | NLSpec for the web UI | Kilroy |
| **Pipeline (Kilroy)** | | |
| `pomelli-pipeline.dot` | The Attractor pipeline graph — defines the full build workflow | Kilroy CLI |
| `run.yaml` | Kilroy run configuration (providers, repo path, etc.) | Kilroy CLI |
| **Scenarios (human-facing, holdout)** | | |
| `scenarios.md` | Validation scenarios — never shown to agents | You (manual evaluation) |
| **Plans** | | |
| `pomelli-clone-weekend-plan.md` | Full weekend-by-weekend execution plan | You |

## Prerequisites

### Install Kilroy
```bash
git clone https://github.com/danshapiro/kilroy.git
cd kilroy
go build -o kilroy ./cmd/kilroy
# Add to PATH or copy to your project
```

### Install a Coding Agent Backend (at least one)
```bash
# Claude Code (recommended primary)
npm install -g @anthropic-ai/claude-code

# Codex CLI (optional secondary)
npm install -g @openai/codex

# Gemini CLI (optional tertiary)
npm install -g @google/gemini-cli
```

### Set API Keys
```bash
export ANTHROPIC_API_KEY=sk-ant-...
# Optional:
export OPENAI_API_KEY=sk-...
export GOOGLE_API_KEY=...
```

## How to Use This

### Step 1: Set Up the Target Repo

```bash
mkdir pomelli-clone && cd pomelli-clone
git init

# Copy specs into the repo (agents WILL see these)
mkdir specs
cp /path/to/this-package/brand-dna-extractor.md specs/
cp /path/to/this-package/campaign-generator.md specs/
cp /path/to/this-package/pomelli-clone-app.md specs/

# Copy the pipeline and config
cp /path/to/this-package/pomelli-pipeline.dot .
cp /path/to/this-package/run.yaml .

# Update run.yaml with the absolute path to this repo
# Edit: repo.path → /absolute/path/to/pomelli-clone

# IMPORTANT: Keep scenarios OUTSIDE this repo
cp /path/to/this-package/scenarios.md ~/pomelli-scenarios/
```

### Step 2: Validate the Pipeline

```bash
kilroy attractor validate --graph pomelli-pipeline.dot
```

This checks that the DOT graph is structurally valid — correct node shapes, valid edges, no dangling references.

**Visualize it** (optional but impressive for the CIO deck):
```bash
# Install graphviz if needed: sudo apt install graphviz
dot -Tpng pomelli-pipeline.dot -o pomelli-pipeline.png
```

### Step 3: Run the Pipeline

```bash
kilroy attractor run --graph pomelli-pipeline.dot --config run.yaml
```

Kilroy will:
1. Execute `scaffold` — initialize the project skeleton
2. Execute `implement_extractor` — spawn Claude Code with the extractor spec
3. Execute `test_extractor` — run tests against the built extractor
4. If tests fail → loop back to `implement_extractor` (with error context)
5. If tests pass → move to `implement_generator`
6. Continue through the full pipeline...
7. Pause at the `review` human gate for your approval

Each completed node creates a git commit, so you have full audit trail.

**Monitor progress:**
```bash
kilroy attractor status --logs-root ./logs
```

**If it stalls or crashes:**
```bash
kilroy attractor resume --logs-root ./logs
```

**To try a different model on a re-run:**
```bash
kilroy attractor run --graph pomelli-pipeline.dot --config run.yaml \
  --force-model anthropic=claude-sonnet-4-20250514
```

### Step 4: Evaluate Scenarios

Once the pipeline reaches the `review` gate (or exits):

1. Start the app: `npm start`
2. Open `~/pomelli-scenarios/scenarios.md`
3. Walk through each scenario
4. Score each criterion: SATISFIED (1), PARTIAL (0.5), NOT SATISFIED (0)
5. Calculate overall satisfaction

### Step 5: Converge

For each failing scenario criterion:
1. Identify what the **spec** was missing
2. Update the spec in `specs/`
3. Re-run the pipeline: `kilroy attractor run --graph pomelli-pipeline.dot --config run.yaml`
4. Re-evaluate scenarios

Track your scores: Run 1 → Run 2 → Run 3 → ... until you hit 70%+ satisfaction.

### The Discipline

> When something breaks, your instinct will be to open the code and fix it.
> Don't. Update the spec instead.
> The spec is the source of truth. The code is disposable.
> The pipeline is the factory. Let the factory do its job.

## Fallback Plan

Kilroy is early-stage software. If it gives you trouble:

1. **Try the manual approach:** Feed specs directly to Claude Code CLI without Kilroy:
   ```bash
   claude "Read specs/brand-dna-extractor.md and implement it fully."
   ```
2. **Hybrid approach:** Use Kilroy for the first module (extractor) to demonstrate the pipeline concept, then build the rest manually.
3. **Demo the pipeline itself:** Even if the full app doesn't converge, the DOT graph visualization + Kilroy execution logs + partial results tell a compelling story about the method.

The CIO presentation works at any level of completion — the *method* is the message, the *product* is the proof.

## What to Show the CIO

1. **The DOT pipeline visualization** — a beautiful flowchart of your automated build process
2. **The git log** — each Kilroy checkpoint commit, showing autonomous progress
3. **The convergence curve** — scenario satisfaction scores improving across runs
4. **The working app** — enter a URL, see the Brand DNA, generate campaigns
5. **The contrast** — two different brands through the same tool, producing distinctly different output
