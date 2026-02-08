---
name: analyze-documents
description: Analyzes all documents in a folder and creates a comprehensive summary. Use when asked to summarize documents, understand a collection of files, get an overview of materials, or analyze what's in a folder.
---

# Document Analyzer

Analyzes all documents in a specified folder and produces a structured summary.

## When to Use

- User asks to "summarize the documents" or "what's in these files"
- User wants an overview of a document collection
- User needs to understand a corpus before diving deeper

## Instructions

1. **List the documents**: Use `ls` or `find` to identify all readable files in the target folder (typically `docs/` for this course)

2. **Read each document**: For each file, extract:
   - Document type (memo, email thread, report, slack export, etc.)
   - Author(s) and recipient(s) if applicable
   - Date or time period covered
   - Key topic or purpose (1-2 sentences)
   - Notable quotes or data points

3. **Identify patterns**: Look for:
   - Recurring themes across documents
   - Key people who appear multiple times
   - Timeline of events
   - Tensions or conflicts
   - Unanswered questions

4. **Produce the summary**:

## Output Format

```markdown
# Document Collection Summary

## Overview
[2-3 sentence high-level summary]

## Documents Analyzed
| File | Type | Date | Key Topic |
|------|------|------|-----------|
| ... | ... | ... | ... |

## Key Themes
1. [Theme 1]
2. [Theme 2]

## Key People
- **[Name]** - [Role/relevance]

## Timeline of Events
- [Date]: [Event]

## Open Questions
- [Question that documents raise but don't answer]

## Recommended Deep Dives
- [Specific document or topic worth examining more closely]
```

## Tips

- For large document sets (10+ files), consider grouping by type or theme
- Pay attention to who's talking to whom—organizational dynamics matter
- Look for what's NOT said as much as what is
- Dates matter—sequence often reveals causation
