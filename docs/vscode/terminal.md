# The Terminal

The terminal is a text-based way to interact with your computer. Instead of clicking buttons, you type commands.

**Don't be intimidated!** You only need a few commands for this course.

## What Is It?

Think of the terminal as a chat window where:
- You type a command
- The computer responds
- You type another command
- And so on...

It's the primary way you'll talk to Claude in this course.

## Opening the Terminal

Press `` Ctrl+` `` (the backtick key, usually below Escape)

Or: View menu → Terminal

## Understanding the Prompt

When the terminal is ready, you'll see something like:

```
@yourname ➜ /workspaces/feedforward-ai-course $
```

Let's break this down:
- `@yourname` - Your username
- `/workspaces/feedforward-ai-course` - Where you are (your current folder)
- `$` - **This means "I'm ready for your command"**

When you see the `$`, you can type.

## Starting Claude

This is the main command you need:

```
claude
```

Type it and press Enter. Claude will start, and you can begin chatting!

## Basic Terminal Commands

| Command | What It Does |
|---------|--------------|
| `claude` | Start talking to Claude |
| `ls` | List files in current folder |
| `clear` | Clear the terminal screen |
| `pwd` | Show current folder path |

You really only need `claude` for this course. The others are just helpful.

## Typing and Entering Commands

1. Type your command
2. Press **Enter** to run it
3. Wait for the response
4. When you see `$` again, you can type another command

**Nothing happens when you type?** Make sure you're clicking inside the terminal first.

## Stopping Things

If something is running and you want to stop it:

Press `Ctrl+C`

This cancels the current operation.

## Common Confusion

**"The terminal disappeared"**
- Press `` Ctrl+` `` to bring it back
- Or look for a "Terminal" tab at the bottom of the screen

**"I see weird text and colors"**
- That's normal! Programs output text in different ways
- Look for the `$` prompt to know when you can type again

**"It says 'command not found'"**
- You probably typed something wrong
- Check for typos
- Commands are case-sensitive (`Claude` won't work, but `claude` will)

**"I'm stuck in something"**
- Press `Ctrl+C` to cancel
- If that doesn't work, press `Ctrl+D` to exit
- If all else fails, close the terminal panel and open a new one

**"How do I get back to Claude?"**
- If you exited Claude, just type `claude` again
- Each time starts a fresh conversation

## Terminal vs. Claude

Don't confuse these:

| You're in... | You see... | To exit... |
|--------------|------------|------------|
| Terminal (waiting) | `$` prompt | (You're already out) |
| Claude | Claude's interface | Type `/exit` or `Ctrl+C` |

## Multiple Terminals

You can have multiple terminal tabs:
- Click the `+` button in the terminal panel
- Or: Terminal menu → New Terminal

Each terminal is independent.

---

*Next: [Markdown Files](markdown.md)*
