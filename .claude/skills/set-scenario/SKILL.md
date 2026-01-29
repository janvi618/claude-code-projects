# Set Scenario: Switch Your Active Practice Environment

This skill lets you switch between different practice scenarios - the default Meridian case study or your own simulated company.

## Invocation

- `/set-scenario` - View current scenario and switch to a different one

## How It Works

The `practice/` folder is a pointer (symlink) to your active scenario. When you do exercises, they'll use whatever `practice/` points to:

- **Meridian** (default): The pre-loaded case study about enterprise AI transformation
- **Your simulation**: A custom scenario you created with `/simulate`

## Workflow

### Step 1: Check Current State

First, determine what `practice/` currently points to:

```bash
readlink practice
```

Report this to the user:
- If it shows `docs` → "You're currently using **Meridian** (the default case study)"
- If it shows `workspace/projects/simulation-*` → "You're currently using **[simulation name]**"
- If the command fails or practice doesn't exist → "No active scenario set. Let me fix that."

### Step 2: Find Available Scenarios

List all available options:

1. **Meridian** (always available) - points to `docs/`
2. **User simulations** - scan `workspace/projects/` for folders starting with `simulation-`

```bash
ls -d workspace/projects/simulation-* 2>/dev/null
```

For each simulation found, read its `PERSONA.md` to get the company name and brief description.

### Step 3: Present Options

Show the user what's available using AskUserQuestion:

> "Which scenario would you like to practice with?"
>
> - **Meridian** - Enterprise AI transformation case study (default)
> - **[Simulation Name]** - [Brief description from PERSONA.md]
> - [Additional simulations if they exist]

If no simulations exist, inform them:
> "You only have Meridian available. Run `/simulate` to create a custom scenario based on your own work."

### Step 4: Switch Scenario

When the user selects a scenario, update the symlink:

```bash
# Remove old symlink
rm practice

# Create new symlink
ln -s [target] practice
```

Where `[target]` is:
- `docs` for Meridian
- `workspace/projects/simulation-YYYY-MM-DD` for a simulation

### Step 5: Confirm the Change

After switching, confirm:

> "Done! Your practice scenario is now **[name]**."
>
> "When you work with files in `practice/`, you'll be using [brief description]."
>
> "To switch scenarios anytime, just run `/set-scenario` again."

## Error Handling

### Broken Symlink
If `practice/` exists but points to a deleted folder:
```bash
# Check if target exists
[ -e practice ] || echo "Broken symlink"
```

If broken, inform the user and offer to reset to Meridian:
> "Your practice scenario points to a folder that no longer exists. Want me to reset it to Meridian?"

### Missing practice/ Symlink
If `practice/` doesn't exist at all, create it pointing to `docs/`:
```bash
ln -s docs practice
```

Then continue with the normal flow.

## Key Principles

1. **Always show current state first** - User should know what they're working with
2. **Make Meridian the safe default** - If anything is broken, fall back to Meridian
3. **Explain what's happening** - Beginners may not know what a symlink is; explain in plain terms
4. **Keep it simple** - This should be a quick operation, not a complex workflow
