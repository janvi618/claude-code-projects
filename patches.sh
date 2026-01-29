#!/bin/bash
# patches.sh - Remote fixes applied to all student Codespaces
#
# This script is fetched and executed by startup.sh on every Codespace start.
# Use this to push fixes to existing students without updating their repos.
#
# IMPORTANT: All patches must be idempotent (safe to run multiple times)

# =============================================================================
# PATCH 1: Ensure pip3 is installed (Debian blocks pip by default)
# =============================================================================

if ! command -v pip3 &> /dev/null; then
    echo "   Installing pip3..."
    sudo apt-get update -qq && sudo apt-get install -y -qq python3-pip
fi

# =============================================================================
# PATCH 2: Fix Claude Code auth conflict (clean up old configurations)
# =============================================================================
# Remove any old apiKeyHelper or primaryApiKey setups that conflict with env var.
# Claude will use ANTHROPIC_API_KEY directly from the environment.

NEEDS_FIX=false

# Check for old apiKeyHelper files
if [ -f ~/.claude/api-key-helper.sh ]; then
    NEEDS_FIX=true
fi

# Check if ~/.claude.json has primaryApiKey (causes conflict with env var)
if [ -f ~/.claude.json ] && grep -q "primaryApiKey" ~/.claude.json 2>/dev/null; then
    NEEDS_FIX=true
fi

if [ "$NEEDS_FIX" = true ]; then
    echo "   Cleaning up Claude Code auth configuration..."

    # Remove old helper scripts
    rm -f ~/.claude/api-key-helper.sh
    rm -f ~/.claude/.api-key
    rm -f ~/.claude/.api-key-backup

    # Rewrite ~/.claude.json WITHOUT primaryApiKey
    cat > ~/.claude.json << 'CLAUDE_JSON'
{
  "hasCompletedOnboarding": true
}
CLAUDE_JSON

    # Clean settings.json
    cat > ~/.claude/settings.json << 'SETTINGS_EOF'
{
  "apiProvider": "anthropic"
}
SETTINGS_EOF

    # Remove old bash alias if present
    sed -i '/alias claude=/d' ~/.bashrc 2>/dev/null || true

    echo "   ✓ Auth configuration cleaned up"
fi

# =============================================================================
# Add future patches below this line
# =============================================================================
