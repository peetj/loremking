# Lorem King — Implementation & Release Guide

This guide covers everything needed to build, test, package, version, publish, and maintain releases of the Lorem King extension. It is aimed at anyone responsible for shipping new versions.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Build and Verification](#local-build-and-verification)
3. [Pre-Release Checklist](#pre-release-checklist)
4. [Versioning Conventions](#versioning-conventions)
5. [Packaging the Extension](#packaging-the-extension)
6. [Publishing to the VS Code Marketplace](#publishing-to-the-vs-code-marketplace)
7. [GitHub Release Workflow](#github-release-workflow)
8. [Post-Release Verification](#post-release-verification)
9. [Hotfix Process](#hotfix-process)
10. [Release Examples](#release-examples)

---

## Prerequisites

Before you can build or publish, make sure you have the following installed:

### Required tools

| Tool | Purpose | Install |
|------|---------|---------|
| Node.js (v18+) | Runtime for building and testing | [nodejs.org](https://nodejs.org) |
| npm | Package manager (ships with Node.js) | Included with Node.js |
| Git | Version control | [git-scm.com](https://git-scm.com) |

### Required for publishing

| Tool | Purpose | Install |
|------|---------|---------|
| `@vscode/vsce` | VS Code Extension packaging and publishing CLI | `npm install -g @vscode/vsce` |
| Personal Access Token (PAT) | Authentication for Marketplace publishing | See [Publishing Setup](#setting-up-marketplace-access) |

### Verify your setup

```bash
node --version
# Expected: v18.x or higher

npm --version
# Expected: 9.x or higher

git --version
# Expected: 2.x or higher

vsce --version
# Expected: 2.x or higher (install with: npm install -g @vscode/vsce)
```

---

## Local Build and Verification

Lorem King has no compile step (plain JavaScript, no TypeScript, no bundler), so "building" means verifying the code is correct and the extension loads properly.

### Step 1: Install dependencies

```bash
npm install
```

This installs dev dependencies (ESLint, test runner, VS Code type definitions). There are no runtime dependencies.

### Step 2: Run the linter

```bash
npm run lint
```

This runs ESLint across all JavaScript files. Fix any warnings or errors before proceeding.

**Example output (clean):**

```
$ npm run lint

> loremking@2.0.0 lint
> eslint .

$
```

No output means no issues.

**Example output (problem found):**

```
$ npm run lint

> loremking@2.0.0 lint
> eslint .

/loremking/extension.js
  3:7  warning  'unusedVar' is assigned a value but never used  no-unused-vars

✖ 1 problem (0 errors, 1 warning)
```

Fix the issue, then run lint again.

### Step 3: Smoke test the modules

You can verify the content library and generator work correctly without launching VS Code:

```bash
node -e "
  const cl = require('./lib/content-library');
  const g = require('./lib/generator');

  // Verify content loads
  console.log('Quotes loaded:', cl.getQuotes().length, 'entries');
  console.log('King-Ipsum loaded:', cl.getKingIpsum().sentences.length, 'sentences');
  console.log('Creepy loaded:', cl.getCreepyPlaceholders().sentences.length, 'sentences');

  // Verify generation works
  console.log('\n--- Quote (with attribution) ---');
  console.log(g.generateQuote(true));

  console.log('\n--- Quote (without attribution) ---');
  console.log(g.generateQuote(false));

  console.log('\n--- King-Ipsum: 2 sentences ---');
  console.log(g.generateBySentences('king-ipsum', 2));

  console.log('\n--- Creepy: 1 paragraph ---');
  console.log(g.generateByParagraphs('creepy-placeholder', 1));

  console.log('\n--- King-Ipsum: 10 words ---');
  console.log(g.generateByWords('king-ipsum', 10));

  console.log('\n--- Creepy: 2 paragraphs ---');
  console.log(g.generateByParagraphs('creepy-placeholder', 2));

  console.log('\nAll checks passed.');
"
```

**Expected**: all sections print content with no errors. If any `require()` fails or a JSON file is malformed, you will see a stack trace.

### Step 4: Run the extension in debug mode

1. Open the `loremking` folder in VS Code
2. Press `F5` to launch the Extension Development Host
3. In the new window, open any file (e.g., create a blank `.txt` or `.html` file)
4. Test each command manually:

**Test Insert Quote:**
1. Place your cursor in the file
2. `Ctrl+Shift+P` → "Lorem King: Insert Quote"
3. Verify: a quote appears at the cursor

**Test Generate Custom Text:**
1. `Ctrl+Shift+P` → "Lorem King: Generate Custom Text"
2. Select "King-Style Ipsum" → "Paragraphs" → "2"
3. Verify: two paragraphs appear, separated by a blank line

**Test Replace Selection:**
1. Type some text and select it
2. `Ctrl+Shift+P` → "Lorem King: Replace Selection with Lorem King Text"
3. Select "Creepy Placeholder" → "Sentences" → "3"
4. Verify: selected text is replaced with 3 creepy sentences

**Test Deadzone Trigger:**
1. Type `deadzone` in the file
2. Accept the autocomplete suggestion
3. Verify: the word is replaced with a quote

**Test Settings:**
1. Open Settings (`Ctrl+,`) and search "Lorem King"
2. Set `includeAttribution` to `false`
3. Run Insert Quote again
4. Verify: the quote appears without the `— Source` suffix

**Test Error Handling:**
1. Close all editor tabs
2. Run any Lorem King command
3. Verify: you see "Lorem King: No active editor found. Open a file first."

---

## Pre-Release Checklist

Run through this list before every release. Check each item off:

```
[ ] All lint issues resolved (npm run lint returns clean)
[ ] Smoke test passes (node -e script above runs without errors)
[ ] All 3 commands work in the Extension Development Host
[ ] Deadzone trigger works
[ ] Settings take effect correctly
[ ] Replace Selection correctly replaces only selected text
[ ] Insert commands work with no selection (insert at cursor)
[ ] Error message shown when no editor is open
[ ] version in package.json is updated
[ ] CHANGELOG.md has an entry for this version
[ ] README.md reflects any new features or changes
[ ] No console.log statements left in production code (except the activation message)
[ ] No hardcoded test data left in content files
[ ] .vscodeignore is up to date (excludes test files, dev configs from the package)
[ ] Git working directory is clean (no uncommitted changes)
```

### Example: running through the checklist

```bash
# Lint
npm run lint

# Smoke test
node -e "require('./lib/content-library'); require('./lib/generator'); console.log('OK');"

# Check version
node -e "console.log(require('./package.json').version);"
# Should print the version you intend to release, e.g., "2.0.0"

# Check git status
git status
# Should show: nothing to commit, working tree clean
```

---

## Versioning Conventions

Lorem King follows [Semantic Versioning](https://semver.org/) (SemVer):

```
MAJOR.MINOR.PATCH
```

### When to bump each number

| Change type | Version bump | Example |
|-------------|-------------|---------|
| Breaking changes to commands, settings, or content format | MAJOR | 1.0.1 → 2.0.0 |
| New features (commands, modes, settings) | MINOR | 2.0.0 → 2.1.0 |
| Bug fixes, content additions, typo corrections | PATCH | 2.1.0 → 2.1.1 |

### Examples

| Scenario | Old version | New version | Why |
|----------|------------|-------------|-----|
| Added 5 new quotes to quotes.json | 2.0.0 | 2.0.1 | Content addition, no feature change |
| Added a new "Gothic Poetry" mode | 2.0.1 | 2.1.0 | New feature |
| Added a keybinding for Insert Quote | 2.1.0 | 2.2.0 | New feature (keybinding) |
| Fixed a bug where word count was off by one | 2.2.0 | 2.2.1 | Bug fix |
| Renamed all commands (breaking change for keybindings) | 2.2.1 | 3.0.0 | Breaking change |
| Removed the deadzone trigger | 2.2.1 | 3.0.0 | Breaking removal of feature |

### Where to update the version

The version number lives in one place:

```
package.json → "version": "2.0.0"
```

You must also add a corresponding entry in `CHANGELOG.md`.

### How to bump the version

```bash
# Patch bump (2.0.0 → 2.0.1)
npm version patch --no-git-tag-version

# Minor bump (2.0.0 → 2.1.0)
npm version minor --no-git-tag-version

# Major bump (2.0.0 → 3.0.0)
npm version major --no-git-tag-version
```

The `--no-git-tag-version` flag prevents npm from auto-creating a commit and tag — we handle those manually for more control.

After bumping, update `CHANGELOG.md` with the new version entry.

---

## Packaging the Extension

Packaging creates a `.vsix` file — a self-contained installable bundle of the extension.

### Step 1: Verify .vscodeignore

The `.vscodeignore` file controls what goes into the package. Check that it excludes development files:

```
.vscode/**
test/**
.eslintrc.json
.vscode-test.mjs
jsconfig.json
vsc-extension-quickstart.md
*.vsix
*.code-workspace
node_modules/**
.git/**
.gitignore
```

**Example: checking what will be included:**

```bash
vsce ls
```

This lists all files that will be included in the `.vsix`. Review it and make sure no test files, dev configs, or old `.vsix` files are included.

**Example output:**

```
extension.js
package.json
README.md
CHANGELOG.md
LICENSE
nexgen_logo_2024.png
images/LoremKingCMD.gif
images/LoremKingREPLACE.gif
content/quotes.json
content/king-ipsum.json
content/creepy-placeholders.json
lib/content-library.js
lib/generator.js
docs/USER_GUIDE.md
docs/DEVELOPER_GUIDE.md
docs/RELEASE_GUIDE.md
```

If you see files that should not be there (e.g., `test/`, `.eslintrc.json`), add them to `.vscodeignore`.

### Step 2: Package

```bash
vsce package
```

**Example output:**

```
 DONE  Packaged: /path/to/loremking/loremking-2.0.0.vsix (15 files, 45.2KB)
```

The `.vsix` file is created in the project root.

### Step 3: Test the packaged extension

Before publishing, install the `.vsix` locally to verify it works outside of debug mode:

```bash
code --install-extension loremking-2.0.0.vsix
```

Then:
1. Restart VS Code (or reload the window)
2. Open a file
3. Run each command and verify it works
4. Check that settings appear in the Settings UI

If everything works, you are ready to publish.

### Step 4: Uninstall the test installation

After verifying, uninstall the local copy so it does not conflict:

```bash
code --uninstall-extension NexgenSTEMSchool.loremking
```

Or uninstall from the Extensions sidebar in VS Code.

---

## Publishing to the VS Code Marketplace

### Important links

Keep these bookmarked — they are not easy to find through normal navigation:

| Link | Purpose |
|------|---------|
| [Publisher Management](https://marketplace.visualstudio.com/manage/publishers/NexgenSTEMSchool) | Manage your published extensions, view installs, update listings |
| [Azure DevOps Org Setup](https://aex.dev.azure.com) | Create or manage your Azure DevOps organization (required for PATs) |
| [Marketplace Listing](https://marketplace.visualstudio.com/items?itemName=NexgenSTEMSchool.loremking) | Public extension page on the Marketplace |

### Finding your account (if you forget)

If you cannot remember which Microsoft account is tied to your publisher:

1. **Search your email inboxes** for `"Visual Studio Marketplace"` or `"NexgenSTEMSchool"` or `"Azure DevOps"`
2. The email that has results is the account you used — it will usually contain a link to the publisher management page
3. Sign in with that account at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
4. You should see your publisher and extensions listed

**Do not** go to `portal.azure.com` — that is the Azure Portal (cloud infrastructure), which is a completely separate product from Azure DevOps. They share the same login but are different sites.

### Setting up Marketplace access (one-time)

1. **Sign in to your publisher page** at [marketplace.visualstudio.com/manage/publishers/NexgenSTEMSchool](https://marketplace.visualstudio.com/manage/publishers/NexgenSTEMSchool) — verify you can see the Lorem King extension listed

2. **Create or access your Azure DevOps organization:**
   - Go to [aex.dev.azure.com](https://aex.dev.azure.com) and sign in with the **same Microsoft account** as your publisher
   - If you already have an organization, it will be listed. If not, create one (any name is fine)
   - Once you are inside your organization, go to `dev.azure.com/<your-org>`

3. **Create a Personal Access Token (PAT):**
   - In Azure DevOps, click the **User Settings icon** (small person/gear icon next to your avatar in the **top right**)
   - Click **Personal access tokens**
   - Click **"New Token"**
   - Set the name to something like `vsce-loremking`
   - Set the organization to **"All accessible organizations"**
   - Set the expiration to the maximum (1 year) — set a calendar reminder to renew it before it expires
   - Under Scopes, select **Custom defined**, then find and check **Marketplace → Manage**
   - Click Create and **copy the token immediately** (you cannot view it again)

4. **Log in with vsce:**

   ```bash
   vsce login NexgenSTEMSchool
   ```

   Paste your PAT when prompted.

   **Example:**

   ```
   $ vsce login NexgenSTEMSchool
   Personal Access Token for publisher 'NexgenSTEMSchool':
   ****************************************************
   The Personal Access Token verification succeeded for the publisher 'NexgenSTEMSchool'.
   ```

5. **Verify everything is connected:**

   ```bash
   vsce verify-pat NexgenSTEMSchool
   ```

   If this succeeds, you are ready to publish. If it fails, your PAT may be missing the Marketplace scope — create a new one with the correct permissions.

### Renewing an expired PAT

PATs expire (max 1 year). When yours expires:

1. `vsce publish` will fail with an authorization error
2. Go to Azure DevOps → User Settings → Personal access tokens
3. You will see your old expired token listed
4. Create a new token with the same settings as above
5. Run `vsce login NexgenSTEMSchool` again with the new token

### Publishing a new version

Once logged in, publishing is a single command:

```bash
vsce publish
```

**Example output:**

```
 DONE  Published NexgenSTEMSchool.loremking@2.0.0
```

The extension is now live on the [VS Code Marketplace](https://marketplace.visualstudio.com/).

### Publishing with a version bump in one step

You can combine bumping and publishing:

```bash
# Publish and bump patch version
vsce publish patch

# Publish and bump minor version
vsce publish minor

# Publish and bump major version
vsce publish major
```

**Example:**

```bash
$ vsce publish minor
 DONE  Published NexgenSTEMSchool.loremking@2.1.0
```

This automatically updates `package.json` and publishes. Note: you still need to update `CHANGELOG.md` manually.

### Verifying the published version

After publishing, verify on the Marketplace:

```
https://marketplace.visualstudio.com/items?itemName=NexgenSTEMSchool.loremking
```

Check that:
- The version number is correct
- The README renders properly
- The icon displays
- The description is up to date

---

## GitHub Release Workflow

After publishing to the Marketplace, create a matching GitHub release for traceability.

### Step 1: Tag the release

```bash
git tag -a v2.0.0 -m "Lorem King v2.0.0 — content library, 3 modes, custom generation"
```

**Example: listing tags to verify:**

```bash
git tag
# v1.0.0
# v1.0.1
# v2.0.0
```

### Step 2: Push the tag

```bash
git push origin v2.0.0
```

### Step 3: Create the GitHub release

Using the GitHub CLI (`gh`):

```bash
gh release create v2.0.0 loremking-2.0.0.vsix \
  --title "Lorem King v2.0.0" \
  --notes "$(cat <<'EOF'
## What's New in v2.0.0

### Added
- Three content modes: Quote Mode, King-Style Ipsum, Creepy Placeholder
- Text generation by words, sentences, and paragraphs
- Command: "Lorem King: Generate Custom Text" with mode/unit/amount selection
- Command: "Lorem King: Replace Selection with Lorem King Text"
- Extension settings: defaultMode, defaultParagraphCount, includeAttribution
- Structured content library using JSON files
- User Guide and Developer Guide documentation

### Changed
- "Insert Stephen King Quote" command renamed to "Lorem King: Insert Quote"
- Deadzone completion provider now works in all file types
- Quotes now support optional attribution based on settings

### Preserved
- `deadzone` inline trigger and autocomplete behavior from v1

## Installation

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=NexgenSTEMSchool.loremking) or download the `.vsix` file attached to this release.
EOF
)"
```

This creates a GitHub release with the `.vsix` file attached as a downloadable asset.

**Alternatively, using the GitHub web UI:**

1. Go to `https://github.com/peetj/loremking/releases/new`
2. Choose the tag `v2.0.0`
3. Set the title to "Lorem King v2.0.0"
4. Paste the release notes from `CHANGELOG.md`
5. Attach the `.vsix` file
6. Click "Publish release"

### Example: full release flow from start to finish

```bash
# 1. Make sure everything is committed and clean
git status

# 2. Bump the version
npm version minor --no-git-tag-version

# 3. Update CHANGELOG.md with new version entry (manually)

# 4. Commit the version bump
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 2.1.0"

# 5. Tag
git tag -a v2.1.0 -m "Lorem King v2.1.0"

# 6. Push
git push origin main
git push origin v2.1.0

# 7. Package
vsce package

# 8. Publish to Marketplace
vsce publish

# 9. Create GitHub release
gh release create v2.1.0 loremking-2.1.0.vsix \
  --title "Lorem King v2.1.0" \
  --notes-file CHANGELOG_SNIPPET.md
```

---

## Post-Release Verification

After publishing, verify everything is working in a real user environment.

### Step 1: Install from the Marketplace

```bash
code --install-extension NexgenSTEMSchool.loremking
```

Or search for "Lorem King" in the VS Code Extensions sidebar and click Install.

### Step 2: Verify the version

1. Open VS Code
2. Go to Extensions sidebar (`Ctrl+Shift+X`)
3. Find Lorem King
4. Check that the version number matches what you published

### Step 3: Run through the core test cases

| Test | Expected result |
|------|----------------|
| `Ctrl+Shift+P` → "Lorem King: Insert Quote" | Quote appears at cursor |
| Same command with attribution OFF in settings | Quote appears without `— Source` |
| `Ctrl+Shift+P` → "Lorem King: Generate Custom Text" → King-Style Ipsum → Paragraphs → 2 | Two paragraphs with a blank line between |
| Select text → "Lorem King: Replace Selection..." → Creepy Placeholder → Sentences → 3 | Selected text replaced with 3 sentences |
| Type `deadzone` → accept autocomplete | Word replaced with a quote |
| Close all editors → run any command | "No active editor" message shown |
| Run Replace Selection with nothing selected | "No text selected" message shown |
| Settings → search "Lorem King" | 3 settings appear with correct types and defaults |

### Step 4: Check the Marketplace listing

Visit the Marketplace page and verify:
- Version number is correct
- README renders with proper formatting, images, and tables
- Icon is displayed
- Keywords and description are accurate
- The "Install" button works

---

## Hotfix Process

If a critical bug is found after release, follow this expedited process:

### Example: fixing a crash when quotes.json is empty

```bash
# 1. Create a hotfix branch from the latest release tag
git checkout -b hotfix/empty-quotes v2.0.0

# 2. Fix the bug
# (edit the relevant file)

# 3. Test the fix
npm run lint
node -e "require('./lib/content-library'); require('./lib/generator'); console.log('OK');"

# 4. Bump the patch version
npm version patch --no-git-tag-version
# 2.0.0 → 2.0.1

# 5. Update CHANGELOG.md
# Add a [2.0.1] entry describing the fix

# 6. Commit
git add -A
git commit -m "fix: handle empty quotes array gracefully"

# 7. Merge to main
git checkout main
git merge hotfix/empty-quotes

# 8. Tag and push
git tag -a v2.0.1 -m "Lorem King v2.0.1 — hotfix for empty quotes"
git push origin main
git push origin v2.0.1

# 9. Package and publish
vsce package
vsce publish

# 10. Create GitHub release
gh release create v2.0.1 loremking-2.0.1.vsix \
  --title "Lorem King v2.0.1 (Hotfix)" \
  --notes "Fixed crash when quotes.json is empty."

# 11. Clean up
git branch -d hotfix/empty-quotes
```

### Hotfix vs regular release

| Aspect | Regular release | Hotfix |
|--------|----------------|--------|
| Branch from | `main` | Release tag (e.g., `v2.0.0`) |
| Version bump | Minor or major | Patch only |
| Scope | New features, improvements | Bug fixes only |
| Testing | Full pre-release checklist | Focused on the bug + smoke test |
| Turnaround | Planned | As fast as safely possible |

---

## Release Examples

### Example 1: Content-only release (adding quotes)

You added 10 new quotes to `quotes.json` and want to release.

```bash
# Bump patch
npm version patch --no-git-tag-version
# 2.0.0 → 2.0.1

# Update CHANGELOG
# [2.0.1] - 2026-04-01
# ### Added
# - 10 new quotes to the Quote Mode content library

# Commit
git add content/quotes.json package.json CHANGELOG.md
git commit -m "content: add 10 new quotes"

# Tag, push, package, publish
git tag -a v2.0.1 -m "v2.0.1 — new quotes"
git push origin main --tags
vsce package
vsce publish
```

### Example 2: Feature release (new mode)

You added a "Gothic Poetry" mode with a new content file and updated all relevant code.

```bash
# Bump minor
npm version minor --no-git-tag-version
# 2.0.1 → 2.1.0

# Update CHANGELOG
# [2.1.0] - 2026-05-15
# ### Added
# - Gothic Poetry content mode
# - content/gothic-poetry.json with 20 sentences and 10 fragments

# Commit all changes
git add content/gothic-poetry.json lib/content-library.js extension.js package.json CHANGELOG.md README.md
git commit -m "feat: add Gothic Poetry content mode"

# Tag, push, package, publish
git tag -a v2.1.0 -m "v2.1.0 — Gothic Poetry mode"
git push origin main --tags
vsce package
vsce publish
gh release create v2.1.0 loremking-2.1.0.vsix \
  --title "Lorem King v2.1.0" \
  --notes "Added Gothic Poetry content mode with 20 sentences and 10 fragments."
```

### Example 3: Bug fix release

The word count generator was returning one extra word.

```bash
# Fix the bug in lib/generator.js
# (edit file)

# Verify the fix
node -e "
  const g = require('./lib/generator');
  const result = g.generateByWords('king-ipsum', 10);
  const count = result.split(/\s+/).length;
  console.log('Word count:', count, count === 10 ? 'PASS' : 'FAIL');
"

# Bump patch
npm version patch --no-git-tag-version
# 2.1.0 → 2.1.1

# Update CHANGELOG
# [2.1.1] - 2026-05-20
# ### Fixed
# - Word count generator now returns exact requested count

# Commit
git add lib/generator.js package.json CHANGELOG.md
git commit -m "fix: correct off-by-one in word count generation"

# Tag, push, package, publish
git tag -a v2.1.1 -m "v2.1.1 — word count fix"
git push origin main --tags
vsce package
vsce publish
```

---

## Quick Reference

### Essential commands

```bash
# Lint
npm run lint

# Smoke test
node -e "require('./lib/content-library'); require('./lib/generator'); console.log('OK');"

# Debug in VS Code
# Press F5

# List package contents
vsce ls

# Package
vsce package

# Publish
vsce publish

# Install local .vsix
code --install-extension loremking-2.0.0.vsix

# Uninstall
code --uninstall-extension NexgenSTEMSchool.loremking

# Create git tag
git tag -a v2.0.0 -m "description"

# Push tag
git push origin v2.0.0
```

### File checklist for each release

| File | Action needed |
|------|--------------|
| `package.json` | Bump `version` |
| `CHANGELOG.md` | Add new version entry |
| `README.md` | Update if features changed |
| `.vscodeignore` | Verify exclusions if new files were added |
| Content JSON files | Verify no syntax errors (`node -e "require('./content/quotes.json')"`) |
