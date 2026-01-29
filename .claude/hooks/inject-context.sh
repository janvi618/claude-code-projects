#!/bin/bash
# This hook runs after /clear or /compact to remind Claude of key context

cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "CONTEXT REMINDER: This is an AI course for executives learning Claude Code. The user is a BEGINNER—be verbose, explain every step, define terms. Key paths: docs/ (scenario docs), data/ (CSVs), workspace/ (their work). Skills: /simulate, /feedback, /help. Teaching mode is ON. Read CLAUDE.md for full guidance."
  }
}
EOF

exit 0
