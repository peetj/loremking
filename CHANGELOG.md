# Change Log

All notable changes to the "Lorem King" extension will be documented in this file.

## [2.0.0] - 2026-03-19

### Added
- Three content modes: Quote Mode, King-Style Ipsum, Creepy Placeholder
- Text generation by words, sentences, and paragraphs
- Command: "Lorem King: Generate Custom Text" with mode/unit/amount selection
- Command: "Lorem King: Replace Selection with Lorem King Text"
- Extension settings: `loremKing.defaultMode`, `loremKing.defaultParagraphCount`, `loremKing.includeAttribution`
- Structured content library using JSON files (`content/` directory)
- Content library loader module (`lib/content-library.js`)
- Text generator module (`lib/generator.js`)

### Changed
- "Insert Stephen King Quote" command renamed to "Lorem King: Insert Quote"
- Deadzone completion provider now works in all file types (not just JS/HTML)
- Quotes now support optional attribution based on settings

### Preserved
- `deadzone` inline trigger and autocomplete behavior from v1

## [1.0.1] - 2024-09-06

- Minor fixes

## [1.0.0] - 2024-08-30

- Initial release of Lorem King
