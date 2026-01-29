# Markdown Files

Markdown is a simple way to write formatted documents. Files ending in `.md` use markdown.

## What Is Markdown?

It's like a shorthand for formatting:
- `# Heading` becomes a big heading
- `**bold**` becomes **bold**
- `- item` becomes a bullet point

The beauty is that it's still readable even without formatting!

## Two Ways to View

### Raw View (Code View)
Shows the formatting codes:
```
# My Heading
This is **bold** and this is *italic*.
- Bullet one
- Bullet two
```

### Preview View
Shows the formatted result:
> # My Heading
> This is **bold** and this is *italic*.
> - Bullet one
> - Bullet two

## How to Preview a Markdown File

### Method 1: Preview Button
1. Open any `.md` file
2. Look in the top-right corner of the editor
3. Click the icon that looks like a split rectangle with a magnifying glass
4. A preview panel opens to the side

### Method 2: Keyboard Shortcut
- Mac: `Cmd+Shift+V`
- Windows: `Ctrl+Shift+V`

This opens preview in a new tab.

### Method 3: Side-by-Side
- Mac: `Cmd+K` then `V` (press K, release, then press V)
- Windows: `Ctrl+K` then `V`

This shows raw and preview side by side - great for editing!

### Method 4: Right-Click
1. Right-click the file tab
2. Select "Open Preview"

## Basic Markdown Syntax

Here's what you need to know:

### Headings
```markdown
# Big Heading (H1)
## Medium Heading (H2)
### Smaller Heading (H3)
```

### Text Formatting
```markdown
**bold text**
*italic text*
~~strikethrough~~
```

### Lists
```markdown
Bullet list:
- First item
- Second item
- Third item

Numbered list:
1. First item
2. Second item
3. Third item
```

### Links
```markdown
[Link text](https://example.com)
```

### Code
```markdown
Inline `code` looks like this.

Code block:
```
Multiple lines
of code
```
```

### Quotes
```markdown
> This is a quote.
> It can span multiple lines.
```

### Tables
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
| Data 3   | Data 4   |
```

## Common Confusion

**"The formatting isn't showing"**
- You're in raw view. Open the preview (`Cmd+Shift+V` / `Ctrl+Shift+V`)

**"The preview looks weird"**
- Check your syntax - maybe a missing `*` or `#`
- Markdown needs a blank line before lists and headings

**"How do I edit while previewing?"**
- Use side-by-side mode: `Cmd+K V` / `Ctrl+K V`

---

*Next: [Keyboard Shortcuts](keyboard-shortcuts.md)*
