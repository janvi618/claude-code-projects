# WTF: Help for VS Code & Claude Code Beginners

An interactive helper for when you're confused about VS Code, the terminal, Claude Code features, or how this whole thing works.

## Invocation

- `/wtf` - Get help with VS Code, Claude Code, or the environment
- `/wtf [question]` - Ask a specific question (e.g., `/wtf what are slash commands`)

## Purpose

This skill helps absolute beginners understand:
- The VS Code interface (sidebar, editor, terminal)
- How to navigate files and folders
- The terminal and how to use it
- Markdown files and how to preview them
- Extensions and what they do
- **Claude Code features** (slash commands, settings, MCP, hooks, etc.)

## Tone

Be **extremely patient and friendly**. Use:
- Simple analogies (compare to familiar things)
- Visual descriptions (describe what they should see)
- Step-by-step instructions (numbered, clear)
- Encouragement (this stuff is confusing at first!)

Never assume they know technical terms. Define everything.

## Workflow

### If invoked with no question (`/wtf`)

Start with a friendly prompt using AskUserQuestion:

> "No worries, I'm here to help! What's confusing you?"

Options:
- **The layout** - I don't understand what I'm looking at
- **Files & folders** - I can't find or open files
- **The terminal** - That black box with text
- **Markdown** - Making .md files look nice
- **Claude basics** - How do I talk to the AI?
- **Claude Code features** - Slash commands, settings, MCP, hooks, etc.

Based on their answer, provide targeted help (see sections below).

### Detecting Claude Code Questions

If the user asks about any of these topics (even without selecting from menu), treat it as a Claude Code question and consult the documentation:
- Slash commands (like `/help`, `/compact`, `/clear`)
- Settings and configuration
- MCP (Model Context Protocol) servers
- Hooks (pre/post command hooks)
- Memory and context management
- Keyboard shortcuts in Claude
- The `.claude/` folder structure
- CLAUDE.md files
- Skills, agents, or plugins

### If invoked with a question (`/wtf [question]`)

Answer their specific question directly, then offer to explain more.

---

## Help Content by Topic

### The Layout

> "VS Code is like a desk with different areas. Here's what you're looking at:"

Describe the layout:
```
┌─────────────────────────────────────────────────────────────┐
│  TOP: Menu bar (File, Edit, View...)                        │
├──────────┬──────────────────────────────────────────────────┤
│ LEFT:    │  CENTER: Editor                                  │
│ Sidebar  │  This is where you read and write files          │
│          │  Like a word processor                           │
│ Shows    │                                                  │
│ files,   ├──────────────────────────────────────────────────┤
│ search,  │  BOTTOM: Terminal                                │
│ etc.     │  Where you type commands and talk to Claude      │
└──────────┴──────────────────────────────────────────────────┘
```

Offer to explain any specific area in more detail.

### Files & Folders (Sidebar)

> "The sidebar on the left shows your files - like the file explorer on your computer."

Key points to cover:
1. **Opening the sidebar**: Click the paper-stack icon (top-left) or press `Cmd+Shift+E` / `Ctrl+Shift+E`
2. **The folder structure**: Explain what each folder is for:
   - `docs/` - Course documents
   - `data/` - CSV files for analysis
   - `practice/` - Your active practice scenario
   - `workspace/` - Your personal work area
3. **Opening files**:
   - Single click = preview (temporary)
   - Double click = open permanently
4. **Creating files**: Right-click in the sidebar → New File

If they can't see the sidebar:
> "Your sidebar might be hidden. Try pressing `Cmd+B` (Mac) or `Ctrl+B` (Windows) to toggle it."

### The Terminal

> "The terminal is like a text-based chat window. Instead of clicking buttons, you type commands."

Key points:
1. **Opening it**: Press the backtick key `` Ctrl+` `` (below Escape) or go to View → Terminal
2. **What the prompt means**:
   ```
   @username ➜ /workspaces/feedforward-ai-course $
   ```
   The `$` means "I'm ready for your command"
3. **Starting Claude**: Type `claude` and press Enter
4. **If it disappeared**: It might be minimized. Look for "Terminal" at the bottom, or press `` Ctrl+` `` again

Common confusion points:
- **"Nothing's happening"**: Did you press Enter after typing?
- **"I see weird text"**: That's normal output. Look for the `$` prompt to type again.
- **"How do I stop something"**: Press `Ctrl+C` to cancel

### Markdown Files

> "Markdown is a simple way to write formatted documents. Files ending in `.md` use markdown."

Explain the two views:
1. **Raw/Code view**: Shows the formatting codes like `# Heading` and `**bold**`
2. **Preview**: Shows the pretty, formatted result

How to preview:
1. Open any `.md` file (like this guide!)
2. Look for the preview button in the top-right corner (split rectangle with magnifying glass icon)
3. Or press `Cmd+Shift+V` (Mac) / `Ctrl+Shift+V` (Windows)
4. Or right-click the file tab → "Open Preview"

Side-by-side view:
> "Want to see both? Press `Cmd+K V` (Mac) or `Ctrl+K V` (Windows) - that's K then V, not together."

### Using Claude

> "You can talk to Claude in two ways. For this course, we use the terminal."

**Terminal Claude (use this!):**
1. Open terminal (`` Ctrl+` ``)
2. Type `claude`
3. Press Enter
4. Start chatting!

**Extension Claude (also available):**
- Look for a Claude icon in the sidebar
- Click to open a chat panel
- Good for quick questions

> "Both work, but the course exercises are designed for terminal Claude. That's where `/simulate`, `/set-scenario`, and other skills work."

### Claude Code Features

For questions about Claude Code features, **consult the documentation** at `docs/claude-code/`.

> "Claude Code has a lot of powerful features. Let me look that up for you..."

**How to answer Claude Code questions:**

1. **Read the relevant documentation** from `docs/claude-code/`
2. **Summarize in plain English** - don't just dump the docs on them
3. **Give a simple example** if applicable
4. **Offer to go deeper** if they want more detail

**Key documentation files to reference:**

| Topic | Look in |
|-------|---------|
| Slash commands | `docs/claude-code/slash-commands.md` |
| Settings & config | `docs/claude-code/settings.md` |
| MCP servers | `docs/claude-code/mcp.md` |
| Hooks | `docs/claude-code/hooks.md` or `hooks-reference.md` |
| Memory | `docs/claude-code/memory.md` |
| CLI reference | `docs/claude-code/cli-reference.md` |
| Getting started | `docs/claude-code/quickstart.md` |
| Common workflows | `docs/claude-code/common-workflows.md` |

**Common beginner questions:**

**"What slash commands are there?"**
> Read `docs/claude-code/slash-commands.md` and summarize the most useful ones:
> - `/help` - See available commands
> - `/clear` - Start fresh conversation
> - `/compact` - Summarize conversation to save space
> - `/cost` - See how much this session has cost
> - Tell them there are more in the docs if they're curious.

**"What's MCP?"**
> "MCP stands for Model Context Protocol. It lets Claude connect to external tools and data sources - like giving Claude superpowers to interact with other systems. For this course, you don't need to worry about it yet, but it's there when you're ready."

**"What are hooks?"**
> "Hooks let you run custom scripts before or after Claude does certain things. It's an advanced feature - think of it like setting up automatic actions. You probably won't need this as a beginner."

**"How do I configure Claude?"**
> Read `docs/claude-code/settings.md` and explain the basics:
> - Settings can be in `~/.claude/settings.json` (global) or project-level
> - Most users don't need to change settings
> - Point them to the docs if they want to customize

**"What's CLAUDE.md?"**
> "CLAUDE.md is a special file that gives Claude instructions for a project. When Claude sees this file, it reads it to understand how to help you better. It's like a briefing document. You don't need to edit it - it's already set up for this course."

**If you can't find the answer in docs:**
> "That's a great question. Let me search the Claude Code documentation..."
>
> Use the Glob tool to search `docs/claude-code/` for relevant files, or read the overview files to find the right section.

### I'm Completely Lost

If they seem very confused:

1. Take a breath - remind them this is normal
2. Offer to walk through the basics step by step
3. Point them to the guides:
   > "There are beginner guides in `docs/vscode/` for VS Code and `docs/claude-code/` for Claude features. Want me to walk you through the basics, or would you like me to show you a specific guide?"

If they want a guide, start with `docs/vscode/overview.md` for the big picture.

---

## Handling Specific Questions

### "Where did X go?"

Common things that "disappear":
- **Sidebar**: Press `Cmd+B` / `Ctrl+B` to toggle
- **Terminal**: Press `` Ctrl+` `` or look at bottom of screen
- **A file I was working on**: Check the tabs at the top, or use `Cmd+P` / `Ctrl+P` to search

### "How do I save?"

`Cmd+S` (Mac) or `Ctrl+S` (Windows).

Also explain:
> "You'll see a dot next to the filename in the tab when there are unsaved changes."

### "What's the command palette?"

> "It's like a search bar for everything VS Code can do. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows), then type what you want to do."

### "How do I get back to Claude?"

If they accidentally exited Claude:
> "Just type `claude` in the terminal and press Enter to start a new conversation."

---

## Key Principles

1. **No question is too basic** - Treat every question as valid
2. **Use visuals** - ASCII diagrams, descriptions of what they should see
3. **Verify understanding** - Ask "Does that make sense?" or "Can you see it now?"
4. **Celebrate progress** - "Great, you found it!"
5. **Offer next steps** - After answering, suggest what they might want to learn next

## Reference Documentation

Point users to these resources:

### VS Code Docs: `docs/vscode/`
Beginner-friendly guides written for this course:

| Topic | File |
|-------|------|
| The big picture | `docs/vscode/overview.md` |
| Understanding the layout | `docs/vscode/layout.md` |
| Working with files | `docs/vscode/files.md` |
| Using the terminal | `docs/vscode/terminal.md` |
| Markdown preview | `docs/vscode/markdown.md` |
| Keyboard shortcuts | `docs/vscode/keyboard-shortcuts.md` |
| Common problems | `docs/vscode/troubleshooting.md` |

### Claude Code Docs: `docs/claude-code/`
Full documentation for Claude Code features (auto-updated from Anthropic):

| Topic | File |
|-------|------|
| Overview | `docs/claude-code/overview.md` |
| Getting started | `docs/claude-code/quickstart.md` |
| Common workflows | `docs/claude-code/common-workflows.md` |
| Slash commands | `docs/claude-code/slash-commands.md` |
| Settings | `docs/claude-code/settings.md` |
