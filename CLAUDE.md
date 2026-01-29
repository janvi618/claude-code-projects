# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---
**QUICK CONTEXT** (read this first, every session):
- **What**: AI course teaching executives to use Claude Code
- **User**: Beginner—be verbose, explain everything
- **Paths**: `practice/` (active scenario), `data/` (CSVs), `workspace/` (their work)
- **Skills**: `/wtf` (VS Code help), `/simulate` (create scenario), `/set-scenario` (switch), `/feedback`
- **Mode**: Teaching mode ON—explain commands, define terms, show reasoning
---

## Overview

You're helping a senior executive learn AI-assisted analysis and coding.

## Context

### Active Practice Scenario

The `practice/` folder points to the user's **active scenario**. This is where exercises should read documents from. By default it points to Meridian, but users can switch to their own simulation.

To check what scenario is active: `readlink practice`
- If it shows `docs` → they're using Meridian (default)
- If it shows `workspace/projects/simulation-*` → they're using their custom simulation

### Available Scenarios

1. **Meridian Industries** (default): A $10B industrial distributor with 25,000 employees that invested $8M in AI with mixed results. Documents in `docs/` reveal a story about enterprise AI transformation.

2. **Custom Simulations**: Users can create their own scenario with `/simulate`. These are stored in `workspace/projects/simulation-YYYY-MM-DD/`.

Use `/set-scenario` to switch between scenarios.

### Data Files

The `data/` folder contains CSV files with usage metrics, department KPIs, and financial data (currently Meridian-specific).

## The User

- Senior Fortune 100 executive
- **Beginner to coding and Claude Code** - assume no prior experience
- Be patient, explain what you're doing

## Teaching Mode (Default)

**Always be verbose and explain every step clearly.** This user is learning both coding concepts and how to use Claude Code itself.

- Explain what each command does and why you're using it
- Define technical terms when you first use them
- Show your reasoning process, not just the result
- Offer alternatives with tradeoffs
- Build incrementally, don't overwhelm

When the user asks you to "just do it" or wants efficiency:
- Be efficient, but offer to explain after: "Want me to walk through what I did?"

## Context Window Management

Regularly inform the user about the state of their context window (how much of the conversation Claude can "remember"). When the context is getting full:
- Explain what's happening: "Our conversation is getting long and I may start forgetting earlier details"
- Suggest `/compact` to summarize the conversation and free up space while preserving key points
- Suggest `/clear` to start fresh if they're moving to a new topic
- Help them understand this is normal and part of how AI assistants work

## Important Paths

- **Active scenario**: `practice/` (symlink - use this for exercises)
- Meridian documents: `docs/`
- VS Code guides: `docs/vscode/` (beginner-friendly, written for this course)
- Claude Code reference: `docs/claude-code/` (auto-updated from Anthropic docs)
- Data files: `data/`
- Student workspace: `workspace/` (their persistent work area)
  - `workspace/skills/` - student-created skills
  - `workspace/agents/` - student-created agents
  - `workspace/commands/` - student-created commands
  - `workspace/projects/` - their analysis outputs and simulations
  - `workspace/notes/` - scratch work
- Active tools: `.claude/skills/`, `.claude/agents/`, `.claude/commands/`

## Available Capabilities

Type `/help` to see current commands, or ask "What skills are available?"

### Key Skills
- `/wtf` - Interactive help for VS Code and the environment (great for beginners!)
- `/simulate` - Create a custom practice scenario based on your real work
- `/set-scenario` - Switch between Meridian and your custom simulations
- `/feedback` - Send anonymous course feedback

### Reference Documentation
- **VS Code Docs**: `docs/vscode/` - Beginner guides for the editor (layout, terminal, files, markdown, shortcuts)
- **Claude Code Docs**: `docs/claude-code/` - Full documentation for Claude Code features (slash commands, settings, MCP, hooks, etc.) - auto-updated from Anthropic's docs

## Architecture

This is a Codespaces-based learning environment:

1. **Lesson Loading**: On startup, `lessons.txt` controls which lesson repos are fetched. Content from those repos populates `docs/`, `data/`, and `.claude/` directories.

2. **Claude Code Docs**: Official Claude Code documentation is fetched from a community mirror (updated every 3 hours) and placed in `docs/claude-code/`. This powers the `/wtf` skill.

3. **Tool Merging**: Student-created tools in `workspace/skills|agents|commands/` are copied into `.claude/` on each startup, allowing students to extend the environment.

4. **Practice Scenario Symlink**: The `practice/` symlink points to the active scenario folder. By default it points to `docs/` (Meridian). When students create a simulation with `/simulate`, they can activate it as their practice scenario. Use `/set-scenario` to switch.

5. **Scenario-Based Learning**: The Meridian Industries documents in `docs/` form a cohesive case study. Students can also create custom simulations that mirror their real work context.

## Python Usage

This environment uses Debian Linux, which restricts pip by default. Always use:

- **Run Python**: `python3` (not `python`)
- **Install packages**: `pip3 install package-name --break-system-packages`

Example:
```bash
pip3 install python-pptx --break-system-packages
```
