# Lorem King v2.0 — User Guide

Welcome to Lorem King, a VS Code extension that replaces boring placeholder text with something far more atmospheric. Instead of the usual "Lorem ipsum dolor sit amet," you get horror-themed text inspired by the works of Stephen King.

This guide will walk you through everything you can do with Lorem King v2.0.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Three Content Modes](#the-three-content-modes)
3. [Inserting a Quick Quote](#inserting-a-quick-quote)
4. [Generating Custom Text](#generating-custom-text)
5. [Replacing Selected Text](#replacing-selected-text)
6. [Using the Deadzone Trigger](#using-the-deadzone-trigger)
7. [Configuring Your Settings](#configuring-your-settings)
8. [Common Workflows](#common-workflows)
9. [Tips and Tricks](#tips-and-tricks)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

Once Lorem King is installed, you access it through the **Command Palette**.

To open the Command Palette:
- **Windows/Linux**: `Ctrl + Shift + P`
- **Mac**: `Cmd + Shift + P`

Then type **"Lorem King"** and you will see three commands:

| Command | What it does |
|---------|-------------|
| Lorem King: Insert Quote | Drops a Stephen King quote at your cursor |
| Lorem King: Generate Custom Text | Lets you pick a mode, unit, and amount |
| Lorem King: Replace Selection with Lorem King Text | Replaces highlighted text with generated content |

That's it. No configuration is required to get started — just open a file and run a command.

---

## The Three Content Modes

Lorem King v2.0 offers three distinct flavors of placeholder text. Each has a different tone and purpose.

### Quote Mode

Real quotes attributed to Stephen King and his works. These are complete, meaningful sentences.

**Example output:**

> "The man in black fled across the desert, and the gunslinger followed." — The Dark Tower: The Gunslinger

> "Hope is a good thing, maybe the best of things, and no good thing ever dies. It keeps us going even in the darkest times." — The Shawshank Redemption

**Best for**: adding an interesting placeholder where you want a single impactful sentence, such as a hero section heading, a testimonial block, or a pull quote.

---

### King-Style Ipsum

Longer, atmospheric, horror-flavored text written in a literary style. These are original sentences — not real book passages — that feel like they belong in a dark novel.

**Example output (2 sentences):**

> The hallway stretched on forever, its wallpaper peeling in long strips that curled like dead fingers. Somewhere in the basement, a furnace groaned to life, though no one had touched the thermostat in years.

**Example output (1 paragraph):**

> Rain fell against the windows in a rhythm that sounded too deliberate to be natural. He drove through the night with the radio off, listening to the silence between the towns. Every door in the house was open except one, and that was the one that mattered. She could hear footsteps above her, even though she lived on the top floor.

**Best for**: filling body text areas, article previews, blog post mockups, or anywhere you need multiple paragraphs of placeholder text that actually reads well.

---

### Creepy Placeholder

Short, playful, slightly unsettling lines designed for UI elements. These are punchier and more self-aware — they know they are placeholder text, and they have fun with it.

**Example output (3 sentences):**

> Your content goes here, assuming you make it that far. This is placeholder text, but it is watching you. Insert your copy here before the lights go out.

**Example output (a few words for a button or label):**

> click here if you dare

**Best for**: button labels, form fields, card descriptions, nav items, tooltip text, or any small UI element that needs filler text in a mockup.

---

## Inserting a Quick Quote

This is the simplest way to use Lorem King.

### Steps

1. Place your cursor where you want the quote to appear
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Type **"Lorem King: Insert Quote"**
4. Press Enter

A random Stephen King quote appears at your cursor position.

### Example

**Before** (cursor is at the end of line 3):

```html
<section class="hero">
  <h1>Welcome</h1>
  <p></p>
</section>
```

Run **Lorem King: Insert Quote** with the cursor inside the `<p>` tags.

**After:**

```html
<section class="hero">
  <h1>Welcome</h1>
  <p>"The scariest moment is always just before you start. After that, things can only get better." — On Writing</p>
</section>
```

If you have **Include Attribution** turned off in settings, you will get just the quote text without the source:

```html
<p>The scariest moment is always just before you start. After that, things can only get better.</p>
```

---

## Generating Custom Text

This command gives you full control over what kind of text you want and how much of it.

### Steps

1. Place your cursor where you want the text
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Type **"Lorem King: Generate Custom Text"**
4. **Pick a mode**: Quote Mode, King-Style Ipsum, or Creepy Placeholder
5. **Pick a unit**: Words, Sentences, or Paragraphs
6. **Enter an amount**: type a number (1–100)
7. The generated text is inserted at your cursor

### Example: 2 paragraphs of King-Style Ipsum

1. Run the command
2. Select **King-Style Ipsum**
3. Select **Paragraphs**
4. Type **2**

**Result:**

```
The typewriter keys struck the page with a sound like small bones breaking. There was a smell in the attic that reminded him of libraries and basements and places where things go to be forgotten. Old houses remember everything, even the things their owners try to forget. The road curved through the woods in a way that made you forget which direction you had come from.

She kept the door locked not to keep anything out, but to keep herself from going in. Morning light crept through the curtains like something that did not want to be seen. The clock on the mantel struck thirteen, and no one in the room seemed to notice. A light burned in the upstairs window of the house that had been empty since October.
```

Notice the paragraph break between the two blocks. Each paragraph is separated by a blank line, which renders correctly in HTML, Markdown, and most editors.

### Example: 15 words of Creepy Placeholder

1. Run the command
2. Select **Creepy Placeholder**
3. Select **Words**
4. Type **15**

**Result:**

```
Your content goes here, assuming you make it that far. This is placeholder text,
```

Word mode cuts off at the requested count, so you get approximately 15 words of text.

### Example: 5 sentences of Quotes

1. Run the command
2. Select **Quote Mode**
3. Select **Sentences**
4. Type **5**

**Result:**

```
Monsters are real, and ghosts are real too. They live inside us, and sometimes, they win. Time takes it all, whether you want it to or not. People who try hard to do the right thing always seem mad. The trust of the innocent is the liar's most useful tool. Get busy living, or get busy dying. It's a choice we make every day, in big ways and small.
```

---

## Replacing Selected Text

This command swaps out text you have already selected with freshly generated Lorem King content.

### Steps

1. Select (highlight) the text you want to replace
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Type **"Lorem King: Replace Selection with Lorem King Text"**
4. Pick a mode, unit, and amount (same flow as Generate Custom Text)
5. Your selection is replaced with the generated content

### Example

**Before** (with "Replace this placeholder" selected):

```html
<div class="card">
  <p>Replace this placeholder</p>
</div>
```

Run **Lorem King: Replace Selection**, choose **Creepy Placeholder**, **Sentences**, **1**.

**After:**

```html
<div class="card">
  <p>Here lies placeholder text, may it rest in peace.</p>
</div>
```

Only the selected text is replaced. Everything around it stays exactly as it was.

### What if nothing is selected?

If you run this command with no text selected, Lorem King shows a friendly message:

> "Lorem King: No text selected. Select some text first."

---

## Using the Deadzone Trigger

This is a feature carried over from v1. It is a quick inline shortcut.

### How it works

1. In any file, type the word **deadzone**
2. An autocomplete suggestion appears
3. Accept the suggestion (press Enter or Tab)
4. The word "deadzone" is replaced with a random Stephen King quote

### Example

**You type:**

```
deadzone
```

**Autocomplete appears** with a tooltip: *"Replace 'deadzone' with a random Stephen King quote"*

**After accepting:**

```
"We all float down here, and when you're down here with us, you'll float too." — It
```

This is handy when you want a quick quote without opening the Command Palette. The name is a nod to Stephen King's novel *The Dead Zone*.

---

## Configuring Your Settings

Lorem King has three settings you can adjust. These affect the default behavior of the commands.

### How to access settings

1. Open VS Code Settings:
   - **Windows/Linux**: `Ctrl + ,`
   - **Mac**: `Cmd + ,`
2. Search for **"Lorem King"**
3. You will see three options

### Setting: Default Mode

**Setting name**: `loremKing.defaultMode`

Controls which content mode is used by default. Options:
- `quote` (default)
- `king-ipsum`
- `creepy-placeholder`

This affects the initial selection shown in the mode picker. You can always override it when running a command.

### Setting: Default Paragraph Count

**Setting name**: `loremKing.defaultParagraphCount`

When you choose to generate by paragraphs, this number is pre-filled in the amount input box. Default is **3**. You can set it anywhere from 1 to 20.

**Example**: If you set this to 5, every time you pick "Paragraphs" as the unit, the input box will show "5" instead of "3". You can still change it before confirming.

### Setting: Include Attribution

**Setting name**: `loremKing.includeAttribution`

When enabled (default: **on**), quotes are inserted with their source:

> "The man in black fled across the desert, and the gunslinger followed." — The Dark Tower: The Gunslinger

When disabled, quotes are inserted as plain text:

> The man in black fled across the desert, and the gunslinger followed.

This applies to the Insert Quote command, the deadzone trigger, and Quote Mode in custom generation.

---

## Common Workflows

### Filling a webpage mockup with body text

1. Place your cursor in the body content area
2. Run **Lorem King: Generate Custom Text**
3. Choose **King-Style Ipsum** > **Paragraphs** > **3**
4. Three atmospheric paragraphs appear, separated by blank lines

### Adding placeholder labels to a UI prototype

1. Select the existing placeholder text (e.g., "Button text here")
2. Run **Lorem King: Replace Selection with Lorem King Text**
3. Choose **Creepy Placeholder** > **Words** > **4**
4. The selection becomes something like: "click here if you dare"

### Dropping a quick quote into a test file

1. Place your cursor where you need text
2. Run **Lorem King: Insert Quote**
3. A quote appears instantly — no menus, no choices

### Generating a block of text for an email template

1. Cursor in the email body area
2. Run **Lorem King: Generate Custom Text**
3. Choose **King-Style Ipsum** > **Sentences** > **6**
4. Six literary sentences appear in a single block

### Replacing a large block of dummy text

1. Select the entire block of old placeholder text
2. Run **Lorem King: Replace Selection with Lorem King Text**
3. Choose **King-Style Ipsum** > **Paragraphs** > **2**
4. The old text is gone, replaced with two fresh paragraphs

---

## Tips and Tricks

- **Undo works**: if you do not like the generated text, press `Ctrl+Z` / `Cmd+Z` to undo and try again. Each insert is a single undo step.

- **Run it multiple times**: each run produces different random text, so you can run the same command repeatedly to get variety.

- **Mix modes**: use King-Style Ipsum for body text and Creepy Placeholder for UI labels in the same mockup — they have different tones for different purposes.

- **Turn off attribution for cleaner output**: if you are using quotes as body text and do not want the source appended, disable `loremKing.includeAttribution` in settings.

- **The deadzone trigger works in any file type**: HTML, JavaScript, Python, Markdown — type `deadzone` anywhere and the autocomplete will appear.

- **Paragraph mode adds real line breaks**: the blank lines between paragraphs are actual newlines in your file, not just visual spacing.

---

## Troubleshooting

### "No active editor found" message

You ran a command without having a file open. Open any file first, then try again.

### "No text selected" message

You ran the Replace Selection command but had not highlighted any text. Select some text first, then run the command.

### The deadzone autocomplete does not appear

Make sure you are typing exactly `deadzone` (lowercase, one word). The autocomplete triggers when the word appears at the end of what you have typed on that line.

### Generated text looks the same every time

The text is randomly selected from a pool of entries. With a pool of 30 sentences per mode, occasional repeats are normal. Run the command again for different output.

### Settings do not seem to take effect

After changing settings, the next command you run will use the new values. No restart is required. Make sure you are editing the correct settings scope (User vs Workspace).
