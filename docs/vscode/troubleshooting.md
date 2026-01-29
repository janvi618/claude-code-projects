# Troubleshooting

Common problems and how to fix them.

## "I Can't See the Terminal"

**Solution:** Press `` Ctrl+` `` (backtick key, below Escape)

Still not working?
1. Go to View menu → Terminal
2. Or: Use Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and type "terminal"

## "I Can't See the Sidebar"

**Solution:** Press `Cmd+B` (Mac) or `Ctrl+B` (Windows)

## "I Can't See My Files"

1. Make sure the sidebar is visible (`Cmd+B` / `Ctrl+B`)
2. Click the papers icon at the top of the sidebar
3. Or press `Cmd+Shift+E` / `Ctrl+Shift+E`

## "Claude Won't Start"

When you type `claude` and press Enter:

**If you see "command not found":**
- Make sure you're in the terminal (not in a file)
- Check for typos (it's `claude`, all lowercase)
- Try closing the terminal and opening a new one

**If nothing happens:**
- Did you press Enter?
- Wait a moment - it might be loading

**If you see an error about API key:**
- This is a configuration issue - ask your instructor

## "I'm Stuck in Claude"

To exit Claude:
- Type `/exit` and press Enter
- Or press `Ctrl+C`

You'll see the `$` prompt again when you're back in the regular terminal.

## "Everything Froze"

1. Try pressing `Ctrl+C` to cancel
2. If that doesn't work, close the terminal (click the trash icon in the terminal panel)
3. Open a new terminal (`` Ctrl+` ``)
4. If VS Code is completely frozen, close and reopen the browser tab

## "I Accidentally Closed Something"

**Closed a file:**
- `Cmd+Shift+T` / `Ctrl+Shift+T` reopens the last closed file
- Or use Quick Open (`Cmd+P` / `Ctrl+P`) to find it

**Closed the terminal:**
- Press `` Ctrl+` `` to open a new one

**Closed the sidebar:**
- Press `Cmd+B` / `Ctrl+B` to bring it back

## "My Changes Aren't Saved"

Look at the file tab:
- A **dot** before the filename means unsaved changes
- Press `Cmd+S` / `Ctrl+S` to save

VS Code may also auto-save - check if the dot disappears after a moment.

## "I Can't Find My File"

1. Press `Cmd+P` / `Ctrl+P` (Quick Open)
2. Start typing the filename
3. Select from the list

## "The Preview Won't Open"

For markdown files:
1. Make sure the file ends in `.md`
2. Try `Cmd+Shift+V` / `Ctrl+Shift+V`
3. Or right-click the file tab → "Open Preview"

## "Text Is Too Small/Big"

- Zoom in: `Cmd+=` / `Ctrl+=`
- Zoom out: `Cmd+-` / `Ctrl+-`
- Reset: `Cmd+0` / `Ctrl+0`

## "Colors Look Wrong" / "Can't Read Text"

This might be a theme issue:
1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "color theme"
3. Try a different theme

## "I Need to Start Fresh"

If things are really messed up:
1. Close all terminal tabs
2. Open a new terminal (`` Ctrl+` ``)
3. Type `claude` to start fresh with Claude

For a complete reset, you can close the browser tab and reopen your Codespace.

## Still Stuck?

Type `/wtf` in Claude and describe your problem. Claude can help troubleshoot!

Or ask your instructor.

---

*Back to: [Overview](overview.md)*
