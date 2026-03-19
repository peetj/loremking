# Lorem King v2.0 — Developer Guide

This guide covers the architecture, codebase structure, content system, and extension points of Lorem King v2.0. It is aimed at developers who want to understand, modify, or extend the extension.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Architecture Overview](#architecture-overview)
3. [Content System](#content-system)
4. [Content Library Module](#content-library-module)
5. [Generator Module](#generator-module)
6. [Extension Entry Point](#extension-entry-point)
7. [Commands In Detail](#commands-in-detail)
8. [Settings System](#settings-system)
9. [The Deadzone Completion Provider](#the-deadzone-completion-provider)
10. [Adding New Content](#adding-new-content)
11. [Adding a New Mode](#adding-a-new-mode)
12. [Adding a New Command](#adding-a-new-command)
13. [Debugging and Development](#debugging-and-development)
14. [Code Style and Conventions](#code-style-and-conventions)
15. [Common Modification Scenarios](#common-modification-scenarios)

---

## Project Structure

```
loremking/
├── content/                      # Structured content data
│   ├── quotes.json               # Stephen King quotes (Quote Mode)
│   ├── king-ipsum.json           # Horror lorem ipsum (King-Style Ipsum)
│   └── creepy-placeholders.json  # UI placeholder text (Creepy Placeholder)
├── docs/                         # Documentation
│   ├── USER_GUIDE.md
│   └── DEVELOPER_GUIDE.md
├── images/                       # Extension demo GIFs
├── lib/                          # Internal modules
│   ├── content-library.js        # Content loading and access
│   └── generator.js              # Text generation logic
├── test/
│   └── extension.test.js         # Test scaffold
├── extension.js                  # Main extension entry point
├── package.json                  # Extension manifest
├── .eslintrc.json                # ESLint configuration
└── README.md                     # Marketplace README
```

The extension uses **plain JavaScript** (CommonJS modules, no TypeScript, no bundler). It has zero runtime dependencies — only VS Code's built-in API and Node.js standard library.

---

## Architecture Overview

The extension follows a three-layer design:

```
┌─────────────────────────────────────────┐
│             extension.js                │
│  Commands, UI flows, editor operations  │
├────────────────────┬────────────────────┤
│   lib/generator.js │                    │
│   Text assembly    │                    │
├────────────────────┤                    │
│ lib/content-library.js                  │
│ JSON loading, random selection          │
├─────────────────────────────────────────┤
│            content/*.json               │
│         Structured content data         │
└─────────────────────────────────────────┘
```

**Data flows upward**: `content/*.json` is loaded by `content-library.js`, which is consumed by `generator.js`, which is called by `extension.js`.

**No layer reaches past its neighbor**: `extension.js` never reads JSON directly, and `generator.js` never touches the VS Code API.

---

## Content System

All content lives in `content/` as JSON files. Each mode has its own file.

### Quote format (`quotes.json`)

An array of quote objects:

```json
[
  {
    "text": "Monsters are real, and ghosts are real too. They live inside us, and sometimes, they win.",
    "mode": "quote",
    "source": "Stephen King",
    "tags": ["fear", "human-nature"]
  },
  {
    "text": "The man in black fled across the desert, and the gunslinger followed.",
    "mode": "quote",
    "source": "The Dark Tower: The Gunslinger",
    "tags": ["adventure", "pursuit"]
  }
]
```

Each quote has:
- `text` — the quote string
- `mode` — always `"quote"` for this file
- `source` — the book title or "Stephen King" for general quotes
- `tags` — array of descriptive tags (not currently used in UI, but available for future filtering)

### Ipsum/Placeholder format (`king-ipsum.json`, `creepy-placeholders.json`)

An object with metadata and two arrays:

```json
{
  "mode": "king-ipsum",
  "description": "Horror-flavored literary lorem ipsum fragments",
  "sentences": [
    "The hallway stretched on forever, its wallpaper peeling in long strips that curled like dead fingers.",
    "Somewhere in the basement, a furnace groaned to life, though no one had touched the thermostat in years."
  ],
  "fragments": [
    "the dark corridors of memory",
    "a silence that felt like holding your breath"
  ]
}
```

- `sentences` — complete sentences used for sentence and paragraph generation
- `fragments` — shorter phrases used for word-level generation and potential future use in mixed assembly

### Content rules

- All entries should be original or from the existing quote dataset. Do not add copyrighted book passages.
- Sentences should be self-contained (no cliffhangers that require a second sentence to make sense).
- Fragments are lowercase, no trailing punctuation.
- Tags use lowercase kebab-case.

---

## Content Library Module

**File**: `lib/content-library.js`

This module handles loading JSON files and providing content to the generator. It uses lazy loading with caching — JSON is read from disk on first access and cached in memory for the lifetime of the extension.

### Key functions

```js
const contentLibrary = require("./lib/content-library");
```

#### `getQuotes()`

Returns the full array of quote objects from `quotes.json`.

```js
const quotes = contentLibrary.getQuotes();
// => [{ text: "...", mode: "quote", source: "...", tags: [...] }, ...]
```

#### `getKingIpsum()`

Returns the full king-ipsum object (with `sentences` and `fragments` arrays).

```js
const ipsum = contentLibrary.getKingIpsum();
// => { mode: "king-ipsum", sentences: [...], fragments: [...] }
```

#### `getCreepyPlaceholders()`

Returns the full creepy-placeholders object.

```js
const creepy = contentLibrary.getCreepyPlaceholders();
// => { mode: "creepy-placeholder", sentences: [...], fragments: [...] }
```

#### `getRandomItem(arr)`

Returns a random element from any array. Used internally but exported for convenience.

```js
const item = contentLibrary.getRandomItem(["a", "b", "c"]);
// => "b" (random)
```

#### `getRandomQuote()`

Returns a single random quote object (not just the text — the full object).

```js
const quote = contentLibrary.getRandomQuote();
// => { text: "...", mode: "quote", source: "On Writing", tags: [...] }
```

#### `getSentences(mode, count)`

Returns an array of `count` randomly selected sentences for the given mode.

```js
const sentences = contentLibrary.getSentences("king-ipsum", 3);
// => ["The hallway stretched...", "Rain fell against...", "He drove through..."]
```

The `mode` parameter accepts `"quote"`, `"king-ipsum"`, or `"creepy-placeholder"`. For quote mode, it extracts the `text` field from quote objects.

#### `getFragments(mode)`

Returns the fragments array for the given mode. Only `king-ipsum` and `creepy-placeholder` have fragments. If called with `"quote"`, it falls back to creepy-placeholder fragments.

```js
const fragments = contentLibrary.getFragments("king-ipsum");
// => ["the dark corridors of memory", "a silence that felt like holding your breath", ...]
```

### Caching behavior

```js
// First call: reads from disk
const q1 = contentLibrary.getQuotes();

// Second call: returns cached data (no disk read)
const q2 = contentLibrary.getQuotes();

// q1 === q2 (same reference)
```

There is no cache invalidation. If you edit a JSON file while the extension is running, you need to reload the VS Code window (`Developer: Reload Window`) to pick up changes.

---

## Generator Module

**File**: `lib/generator.js`

This module assembles text from the content library based on mode, unit, and amount.

### Key functions

```js
const generator = require("./lib/generator");
```

#### `generate(mode, unit, amount, includeAttribution)`

The main entry point. Returns a string.

```js
// 3 paragraphs of King-Style Ipsum
const text = generator.generate("king-ipsum", "paragraphs", 3, false);

// 10 words of Creepy Placeholder
const text = generator.generate("creepy-placeholder", "words", 10, false);

// 1 quote sentence with attribution
const text = generator.generate("quote", "sentences", 1, true);
// => '"Monsters are real..." — Stephen King'
```

Parameters:
- `mode` — `"quote"`, `"king-ipsum"`, or `"creepy-placeholder"`
- `unit` — `"words"`, `"sentences"`, or `"paragraphs"`
- `amount` — integer, how many of the unit to produce
- `includeAttribution` — boolean, only affects quote mode

Special case: when `mode === "quote"` and `unit === "sentences"` and `amount === 1`, it delegates to `generateQuote()` which returns a single formatted quote (with optional attribution).

#### `generateQuote(includeAttribution)`

Returns a single quote string. If `includeAttribution` is true, wraps the quote in double-quotes and appends the source.

```js
generator.generateQuote(true);
// => '"The man in black fled across the desert, and the gunslinger followed." — The Dark Tower: The Gunslinger'

generator.generateQuote(false);
// => 'The man in black fled across the desert, and the gunslinger followed.'
```

#### `generateByWords(mode, wordCount)`

Generates a pool of sentences, splits them into words, and returns exactly `wordCount` words joined by spaces.

```js
generator.generateByWords("creepy-placeholder", 8);
// => "Your content goes here, assuming you make it"
```

Implementation detail: it generates 50 sentences as a word pool, then picks words sequentially. If `wordCount` exceeds the pool, it wraps around.

#### `generateBySentences(mode, sentenceCount)`

Returns `sentenceCount` randomly selected sentences joined by spaces.

```js
generator.generateBySentences("king-ipsum", 2);
// => "The fog rolled in at dusk and did not leave for three days... She kept the door locked..."
```

#### `generateByParagraphs(mode, paragraphCount)`

Returns `paragraphCount` paragraphs separated by `\n\n`. Each paragraph contains multiple sentences (4 for king-ipsum and quote, 3 for creepy-placeholder).

```js
generator.generateByParagraphs("king-ipsum", 2);
// => "Sentence. Sentence. Sentence. Sentence.\n\nSentence. Sentence. Sentence. Sentence."
```

The `\n\n` separator ensures proper paragraph breaks in editors and Markdown renderers.

---

## Extension Entry Point

**File**: `extension.js`

This is the VS Code extension entry point. It exports `activate()` and `deactivate()`.

### Activation

The extension activates on `onLanguage:javascript` and `onLanguage:html` (defined in `package.json`). Commands are globally available once the extension is active.

### Structure

```js
const vscode = require("vscode");
const generator = require("./lib/generator");

// Mode and unit option arrays for QuickPick menus
const MODE_OPTIONS = [...];
const UNIT_OPTIONS = [...];

// Helper: read settings
function getConfig() { ... }

// Helper: get active editor or show error
function getEditor() { ... }

// Helper: insert or replace text based on selection state
function insertText(editor, text) { ... }

function activate(context) {
  // Register: loremking.insertQuote
  // Register: loremking.generateCustom
  // Register: loremking.replaceSelection
  // Register: completion provider (deadzone)
  // Register: loremking.replaceDeadZone (internal)
}
```

### Helpers

#### `getConfig()`

Reads the three settings from the VS Code workspace configuration:

```js
const config = getConfig();
// => { defaultMode: "quote", defaultParagraphCount: 3, includeAttribution: true }
```

Settings are read fresh on every command invocation, so changes take effect immediately.

#### `getEditor()`

Returns the active text editor, or `null` if none is open (and shows an informational message).

```js
const editor = getEditor();
if (!editor) return; // message already shown to user
```

#### `insertText(editor, text)`

Inserts text at the cursor if no selection exists, or replaces the selection if text is selected. Returns the `Thenable` from `editor.edit()`.

```js
// Inserts at cursor (no selection)
await insertText(editor, "Hello");

// Replaces selection (text is selected)
await insertText(editor, "Replaced text");
```

---

## Commands In Detail

### `loremking.insertQuote`

Simplest command. Gets the editor, reads attribution setting, generates a quote, inserts it.

```js
vscode.commands.registerCommand("loremking.insertQuote", function () {
  const editor = getEditor();
  if (!editor) return;

  const config = getConfig();
  const text = generator.generateQuote(config.includeAttribution);

  insertText(editor, text);
});
```

No user prompts. One-step insert.

### `loremking.generateCustom`

Multi-step command with three QuickPick/InputBox prompts:

```
User flow:
  1. QuickPick: Select mode (Quote / King-Style Ipsum / Creepy Placeholder)
  2. QuickPick: Select unit (Words / Sentences / Paragraphs)
  3. InputBox: Enter amount (validated: 1–100)
  4. Text is generated and inserted at cursor
```

Each step returns `undefined` if the user presses Escape, which exits the flow cleanly.

The input validation function:

```js
validateInput: (val) => {
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 1 || n > 100) {
    return "Enter a number between 1 and 100";
  }
  return null; // null means valid
}
```

### `loremking.replaceSelection`

Same multi-step flow as `generateCustom`, but:
- Checks that a selection exists before showing prompts
- Uses `editBuilder.replace(editor.selection, text)` instead of `insertText()`

```js
if (editor.selection.isEmpty) {
  vscode.window.showInformationMessage("Lorem King: No text selected. Select some text first.");
  return;
}
```

### `loremking.replaceDeadZone`

Internal command (not shown in Command Palette). Triggered by the completion provider when the user accepts the `deadzone` autocomplete.

```js
const wordRange = document.getWordRangeAtPosition(selection.start, /\bdeadzone\b/);
if (wordRange) {
  const text = generator.generateQuote(config.includeAttribution);
  editor.edit((editBuilder) => {
    editBuilder.replace(wordRange, text);
  });
}
```

---

## Settings System

Settings are declared in `package.json` under `contributes.configuration`:

```json
{
  "title": "Lorem King",
  "properties": {
    "loremKing.defaultMode": {
      "type": "string",
      "default": "quote",
      "enum": ["quote", "king-ipsum", "creepy-placeholder"]
    },
    "loremKing.defaultParagraphCount": {
      "type": "integer",
      "default": 3,
      "minimum": 1,
      "maximum": 20
    },
    "loremKing.includeAttribution": {
      "type": "boolean",
      "default": true
    }
  }
}
```

Settings are read at runtime via:

```js
const config = vscode.workspace.getConfiguration("loremKing");
const mode = config.get("defaultMode", "quote");
```

The second argument to `.get()` is the fallback default. This matches the defaults declared in `package.json`, providing a safety net.

### How settings flow into behavior

| Setting | Where it's used | Effect |
|---------|----------------|--------|
| `defaultMode` | Not currently pre-selecting the QuickPick (available for future use) | Sets the default preference |
| `defaultParagraphCount` | `generateCustom` and `replaceSelection` commands | Pre-fills the amount input when "Paragraphs" is selected |
| `includeAttribution` | `insertQuote`, `replaceDeadZone`, and quote mode in custom generation | Controls whether `"quote" — Source` format is used |

---

## The Deadzone Completion Provider

The completion provider registers for all file types (`{ scheme: "file" }`):

```js
const provider = vscode.languages.registerCompletionItemProvider(
  { scheme: "file" },
  {
    provideCompletionItems(document, position) {
      const linePrefix = document
        .lineAt(position)
        .text.substring(0, position.character);
      if (!linePrefix.endsWith("deadzone")) {
        return undefined;
      }

      const completionItem = new vscode.CompletionItem(
        "deadzone",
        vscode.CompletionItemKind.Text
      );
      completionItem.detail = "Replace 'deadzone' with a random Stephen King quote";
      completionItem.command = {
        command: "loremking.replaceDeadZone",
        title: "Replace DeadZone",
      };

      return [completionItem];
    },
  }
);
```

When the user accepts the completion item, the `loremking.replaceDeadZone` command fires and performs the actual text replacement using a word range match.

---

## Adding New Content

### Adding quotes

Edit `content/quotes.json` and add a new entry to the array:

```json
{
  "text": "Your new quote text here.",
  "mode": "quote",
  "source": "Book Title or Stephen King",
  "tags": ["relevant", "tags"]
}
```

No code changes needed. The content library reads all entries from the array.

### Adding sentences to King-Style Ipsum

Edit `content/king-ipsum.json` and add to the `sentences` array:

```json
"sentences": [
  "...existing sentences...",
  "Your new atmospheric sentence here."
]
```

### Adding sentences to Creepy Placeholder

Same pattern in `content/creepy-placeholders.json`:

```json
"sentences": [
  "...existing sentences...",
  "Your new eerie placeholder sentence here."
]
```

### Adding fragments

Add to the `fragments` array in either `king-ipsum.json` or `creepy-placeholders.json`:

```json
"fragments": [
  "...existing fragments...",
  "your new lowercase fragment"
]
```

After editing content files, reload the VS Code window to pick up changes (the content is cached on first load).

---

## Adding a New Mode

To add a fourth content mode (for example, "Gothic Poetry"):

### Step 1: Create the content file

Create `content/gothic-poetry.json`:

```json
{
  "mode": "gothic-poetry",
  "description": "Dark poetic verse for artistic mockups",
  "sentences": [
    "The raven perched upon the windowsill and spoke of things long buried.",
    "Candlelight traced shadows on the walls like fingers reaching."
  ],
  "fragments": [
    "a whisper in the cathedral",
    "the tolling of a distant bell"
  ]
}
```

### Step 2: Add a loader in `content-library.js`

```js
let gothicData = null;

function getGothicPoetry() {
  if (!gothicData) {
    gothicData = loadJSON("gothic-poetry.json");
  }
  return gothicData;
}
```

Update `getSentences()` and `getFragments()` to handle the new mode:

```js
function getSentences(mode, count) {
  let pool;
  if (mode === "quote") {
    pool = getQuotes().map((q) => q.text);
  } else if (mode === "king-ipsum") {
    pool = getKingIpsum().sentences;
  } else if (mode === "gothic-poetry") {
    pool = getGothicPoetry().sentences;
  } else {
    pool = getCreepyPlaceholders().sentences;
  }
  // ...
}
```

Export the new function.

### Step 3: Add the mode option in `extension.js`

```js
const MODE_OPTIONS = [
  // ...existing modes...
  { label: "Gothic Poetry", value: "gothic-poetry", description: "Dark poetic verse" },
];
```

### Step 4: Register the mode in `package.json` settings

Add the new value to the `enum` and `enumDescriptions` arrays:

```json
"loremKing.defaultMode": {
  "enum": ["quote", "king-ipsum", "creepy-placeholder", "gothic-poetry"],
  "enumDescriptions": [
    "Stephen King quotes with optional attribution",
    "Horror-flavored literary lorem ipsum",
    "Short eerie placeholder text for mockups",
    "Dark poetic verse for artistic mockups"
  ]
}
```

That's it. The generator module does not need changes — it delegates to `contentLibrary.getSentences()` which you already updated.

---

## Adding a New Command

To add a new command (for example, "Lorem King: Insert Paragraph"):

### Step 1: Register in `package.json`

```json
"commands": [
  // ...existing commands...
  {
    "command": "loremking.insertParagraph",
    "title": "Lorem King: Insert Paragraph"
  }
]
```

### Step 2: Implement in `extension.js`

```js
const insertParagraphCommand = vscode.commands.registerCommand(
  "loremking.insertParagraph",
  function () {
    const editor = getEditor();
    if (!editor) return;

    const config = getConfig();
    const text = generator.generate(
      config.defaultMode,
      "paragraphs",
      1,
      config.includeAttribution
    );

    insertText(editor, text);
  }
);

// Add to subscriptions
context.subscriptions.push(insertParagraphCommand);
```

### Step 3: Add activation event (if needed)

If the command should activate the extension on its own, add to `activationEvents`:

```json
"activationEvents": [
  "onCommand:loremking.insertParagraph"
]
```

For commands already covered by language activation, this is not necessary.

---

## Debugging and Development

### Running the extension locally

1. Open the `loremking` folder in VS Code
2. Press `F5` (or go to Run > Start Debugging)
3. A new VS Code window opens with the extension loaded
4. Open any file and test the commands via the Command Palette

The launch configuration is in `.vscode/launch.json`:

```json
{
  "name": "Run Extension",
  "type": "extensionHost",
  "request": "launch",
  "args": ["--extensionDevelopmentPath=${workspaceFolder}"]
}
```

### Running the linter

```bash
npm run lint
```

This runs ESLint with the rules in `.eslintrc.json`.

### Quick smoke test from terminal

You can verify the modules load and generate content without launching VS Code:

```bash
node -e "
  const g = require('./lib/generator');
  console.log('Quote:', g.generateQuote(true));
  console.log('Ipsum:', g.generateBySentences('king-ipsum', 2));
  console.log('Creepy:', g.generateByParagraphs('creepy-placeholder', 1));
  console.log('Words:', g.generateByWords('king-ipsum', 10));
"
```

### Inspecting content loading

```bash
node -e "
  const cl = require('./lib/content-library');
  console.log('Quotes count:', cl.getQuotes().length);
  console.log('Ipsum sentences:', cl.getKingIpsum().sentences.length);
  console.log('Creepy sentences:', cl.getCreepyPlaceholders().sentences.length);
  console.log('Sample quote:', cl.getRandomQuote());
"
```

### Reloading after changes

If you edit `extension.js` or any `lib/` file while the Extension Host is running:
- Press `Ctrl+Shift+F5` (Restart Debugging) in the main VS Code window
- Or run `Developer: Reload Window` in the Extension Host window

If you edit `content/*.json` files, you must reload because content is cached.

If you edit `package.json` (commands, settings), you must restart the Extension Host.

---

## Code Style and Conventions

- **Module system**: CommonJS (`require`/`module.exports`)
- **No TypeScript**: the project uses plain JavaScript with `jsconfig.json` for editor support
- **ECMAScript version**: ES2018 (as configured in `.eslintrc.json`)
- **Naming**: camelCase for functions and variables, kebab-case for mode identifiers, PascalCase only for VS Code API types
- **Settings prefix**: all settings use the `loremKing.` prefix
- **Command prefix**: all commands use the `loremking.` prefix (no camelCase — VS Code convention)
- **No runtime dependencies**: only `vscode`, `path`, and `fs` from Node.js standard library
- **Error handling**: user-facing errors use `vscode.window.showInformationMessage()`, not modal dialogs

---

## Common Modification Scenarios

### "I want to change how many sentences are in a paragraph"

In `lib/generator.js`, find `generateByParagraphs()`:

```js
const sentencesPerParagraph = mode === "creepy-placeholder" ? 3 : 4;
```

Change these numbers. You could also make this a setting by adding a new property to `package.json` and reading it in the generator.

### "I want to add a keybinding for Insert Quote"

Add to `package.json` under `contributes`:

```json
"keybindings": [
  {
    "command": "loremking.insertQuote",
    "key": "ctrl+shift+k",
    "mac": "cmd+shift+k"
  }
]
```

### "I want the mode picker to remember the last selection"

Store the last selected mode in the extension context's `globalState`:

```js
// After the user picks a mode:
context.globalState.update("lastMode", modePick.value);

// Before showing the picker, read it:
const lastMode = context.globalState.get("lastMode", config.defaultMode);
```

Then set `activeItems` on the QuickPick to pre-select it.

### "I want to support right-click context menu"

Add to `package.json`:

```json
"menus": {
  "editor/context": [
    {
      "command": "loremking.insertQuote",
      "group": "loremking"
    },
    {
      "command": "loremking.replaceSelection",
      "group": "loremking",
      "when": "editorHasSelection"
    }
  ]
}
```

No code changes needed — the commands already exist.

### "I want to add unit tests for the generator"

The test scaffold is in `test/extension.test.js`. You can add generator tests alongside it:

```js
// test/generator.test.js
const assert = require("assert");
const generator = require("../lib/generator");

suite("Generator Tests", () => {
  test("generateByWords returns correct word count", () => {
    const result = generator.generateByWords("king-ipsum", 10);
    const words = result.split(/\s+/);
    assert.strictEqual(words.length, 10);
  });

  test("generateByParagraphs returns correct paragraph count", () => {
    const result = generator.generateByParagraphs("king-ipsum", 3);
    const paragraphs = result.split("\n\n");
    assert.strictEqual(paragraphs.length, 3);
  });

  test("generateQuote with attribution includes dash", () => {
    const result = generator.generateQuote(true);
    assert.ok(result.includes("—"), "Should contain em dash for attribution");
  });

  test("generateQuote without attribution has no dash", () => {
    const result = generator.generateQuote(false);
    assert.ok(!result.includes("—"), "Should not contain em dash");
  });
});
```

### "I want to package the extension as a .vsix"

```bash
npx @vscode/vsce package
```

This produces a `loremking-2.0.0.vsix` file you can share or install manually.
