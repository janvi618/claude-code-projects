#!/bin/bash
# startup.sh - Runs EVERY time Codespace starts
# 1. Cleans up any synced VS Code settings/extensions
# 2. Fetches lesson content from external repos
# 3. Merges student workspace content
# 4. Configures Claude Code to use API key without login prompt

echo ""
echo "📚 Feedforward AI Course"
echo "   Loading..."
echo ""

# =============================================================================
# STEP 0: Apply remote patches (self-healing fixes for all students)
# =============================================================================
# Fetches patches.sh from the master repo and runs it. This allows pushing
# fixes to existing Codespaces without updating each student's repo.

PATCHES_URL="https://raw.githubusercontent.com/Feedforward-AI/feedforward-ai-course/main/patches.sh"
curl -s "$PATCHES_URL" 2>/dev/null | bash 2>/dev/null || true

# =============================================================================
# STEP 1: Force clean VS Code settings (overrides whatever synced in)
# =============================================================================

mkdir -p .vscode
cat > .vscode/settings.json << 'SETTINGS_EOF'
{
  "settingsSync.enable": false,
  "workbench.activityBar.visible": false,
  "workbench.sideBar.visible": false,
  "workbench.statusBar.visible": false,
  "workbench.editor.showTabs": "none",
  "workbench.startupEditor": "none",
  "window.menuBarVisibility": "hidden",
  "workbench.layoutControl.enabled": false,
  "workbench.tips.enabled": false,
  "workbench.welcomePage.walkthroughs.openOnInstall": false,
  "editor.minimap.enabled": false,
  "breadcrumbs.enabled": false,
  "window.commandCenter": false,
  "workbench.editor.empty.hint": "hidden"
}
SETTINGS_EOF

# Uninstall any extensions that aren't on our whitelist
ALLOWED_EXTENSIONS="anthropic.claude-code"
for ext in $(code --list-extensions 2>/dev/null); do
  if [[ ! "$ALLOWED_EXTENSIONS" =~ "$ext" ]]; then
    code --uninstall-extension "$ext" 2>/dev/null || true
  fi
done

# =============================================================================
# STEP 2: Ensure directory structure exists
# =============================================================================

mkdir -p .claude/skills .claude/agents .claude/commands
mkdir -p docs data
mkdir -p workspace/skills workspace/agents workspace/commands workspace/projects workspace/notes

# =============================================================================
# STEP 3: Fetch lesson content from external repos
# =============================================================================

# Fetch lessons.txt from the MASTER repo (not the student's fork)
# This allows you to control which lessons are active for all students
MASTER_REPO="https://raw.githubusercontent.com/Feedforward-AI/feedforward-ai-course/main/lessons.txt"
LESSONS=$(curl -s "$MASTER_REPO" 2>/dev/null | grep -v '^#' | grep -v '^$')

# If we couldn't fetch from remote, fall back to local lessons.txt
if [ -z "$LESSONS" ] && [ -f "lessons.txt" ]; then
    LESSONS=$(grep -v '^#' lessons.txt | grep -v '^$')
fi

# Process each lesson repo
for REPO_URL in $LESSONS; do
    echo "   Fetching: $(basename $REPO_URL)"
    
    # Extract repo name for temp directory
    REPO_NAME=$(basename "$REPO_URL" .git)
    TEMP_DIR="/tmp/$REPO_NAME"
    
    # Clone or pull the lesson repo
    if [ -d "$TEMP_DIR" ]; then
        git -C "$TEMP_DIR" pull -q 2>/dev/null
    else
        git clone -q "$REPO_URL" "$TEMP_DIR" 2>/dev/null
    fi
    
    # Copy content (additive - won't overwrite existing files)
    if [ -d "$TEMP_DIR/skills" ]; then
        cp -rn "$TEMP_DIR/skills/"* .claude/skills/ 2>/dev/null || true
    fi
    if [ -d "$TEMP_DIR/agents" ]; then
        cp -rn "$TEMP_DIR/agents/"* .claude/agents/ 2>/dev/null || true
    fi
    if [ -d "$TEMP_DIR/commands" ]; then
        cp -rn "$TEMP_DIR/commands/"* .claude/commands/ 2>/dev/null || true
    fi
    if [ -d "$TEMP_DIR/docs" ]; then
        cp -rn "$TEMP_DIR/docs/"* docs/ 2>/dev/null || true
    fi
    if [ -d "$TEMP_DIR/data" ]; then
        cp -rn "$TEMP_DIR/data/"* data/ 2>/dev/null || true
    fi
done

# =============================================================================
# STEP 4: Fetch Claude Code documentation (for /wtf help)
# =============================================================================

# Clone or update the community-maintained Claude Code docs mirror
# Source: https://github.com/ericbuess/claude-code-docs (updates every 3 hours)
CC_DOCS_REPO="https://github.com/ericbuess/claude-code-docs.git"
CC_DOCS_DIR="/tmp/claude-code-docs"

echo "   Fetching: Claude Code docs"
if [ -d "$CC_DOCS_DIR" ]; then
    git -C "$CC_DOCS_DIR" pull -q 2>/dev/null || true
else
    git clone --depth 1 -q "$CC_DOCS_REPO" "$CC_DOCS_DIR" 2>/dev/null || true
fi

# Copy docs to local directory (overwrite to get updates)
if [ -d "$CC_DOCS_DIR/docs" ]; then
    mkdir -p docs/claude-code
    cp -r "$CC_DOCS_DIR/docs/"* docs/claude-code/ 2>/dev/null || true
fi

# =============================================================================
# STEP 5: Create practice/ symlink (active scenario pointer)
# =============================================================================

# practice/ is a symlink that points to the "active" scenario folder
# Default: points to docs/ (Meridian content)
# Can be changed via /set-scenario to point to a user's simulation
# Note: [ ! -e ] returns false for broken symlinks, so this auto-repairs

if [ ! -e "practice" ]; then
    ln -s docs practice
    echo "   ✓ Practice scenario: Meridian (default)"
else
    # Show what practice currently points to
    TARGET=$(readlink practice 2>/dev/null || echo "docs")
    if [[ "$TARGET" == "docs" ]]; then
        echo "   ✓ Practice scenario: Meridian"
    else
        SCENARIO_NAME=$(basename "$TARGET")
        echo "   ✓ Practice scenario: $SCENARIO_NAME"
    fi
fi

# =============================================================================
# STEP 6: Merge student's own tools into .claude/
# =============================================================================

cp -rn workspace/skills/* .claude/skills/ 2>/dev/null || true
cp -rn workspace/agents/* .claude/agents/ 2>/dev/null || true
cp -rn workspace/commands/* .claude/commands/ 2>/dev/null || true

# =============================================================================
# STEP 7: Configure Claude Code (skip onboarding, use env var for API key)
# =============================================================================
# Codespaces injects ANTHROPIC_API_KEY from the repository secret.
# We just skip onboarding - Claude will use the env var directly.
# Users will see a one-time prompt to accept the API key (select "Yes").

mkdir -p ~/.claude

# Skip onboarding only - do NOT set primaryApiKey (causes conflict with env var)
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo "ANTHROPIC_API_KEY is not set"
else
  cat > ~/.claude.json <<CLAUDE_JSON
{
  "hasCompletedOnboarding": true,
  "customApiKeyResponses": {
    "approved": [
      "${ANTHROPIC_API_KEY: -20}"
    ],
    "rejected": []
  }
}
CLAUDE_JSON
fi

# Minimal settings
cat > ~/.claude/settings.json << 'SETTINGS_EOF'
{
  "apiProvider": "anthropic"
}
SETTINGS_EOF

echo "   ✓ Claude Code: Ready (select 'Yes' when prompted for API key)"

# =============================================================================
# STEP 8: Display status
# =============================================================================

SKILL_COUNT=$(find .claude/skills -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
AGENT_COUNT=$(find .claude/agents -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
COMMAND_COUNT=$(find .claude/commands -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
DOC_COUNT=$(find docs -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "   ✓ Skills: $SKILL_COUNT"
echo "   ✓ Agents: $AGENT_COUNT"
echo "   ✓ Commands: $COMMAND_COUNT"
echo "   ✓ Documents: $DOC_COUNT"
echo ""
echo "✅ Ready! Open terminal (Ctrl+\`) and type: claude"
echo ""
