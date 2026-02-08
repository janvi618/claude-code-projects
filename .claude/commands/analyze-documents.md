---
name: analyze-documents
description: Analyze all documents in a folder and create a comprehensive summary
---

# Analyze Documents

Analyze all documents in a folder and create a comprehensive summary.

## Usage

```
/analyze-documents [folder-path]
```

If no folder path is provided, defaults to `docs/`.

## What This Does

This command invokes the `analyze-documents` skill to:

1. Read all documents in the specified folder
2. Identify document types, authors, dates, and key topics
3. Extract recurring themes and key players
4. Build a timeline of events
5. Surface open questions and recommended deep dives

## Examples

```
/analyze-documents
```
Analyzes the Meridian scenario documents.

```
/analyze-documents workspace/projects/my-research/
```
Analyzes documents in your own project folder.

## Output

You'll receive a structured summary including:
- Document inventory table
- Key themes identified
- Key people and their roles
- Timeline of events
- Open questions
- Recommended areas to explore

$ARGUMENTS
folder_path: Path to folder containing documents (default: docs/)
