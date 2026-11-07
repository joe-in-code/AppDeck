# AppDeck 1.0 — Project Brief (rebuild, M1+)

This is a plan to develop MVP of AppDeck

## Product

AppDeck is a card-based workspace in a single HTML file. Core promise: a small set of cards that behave like the apps people already know, arranged in a split-pane workspace, with an assistant that can read and edit the workspace on request.

## Locked decisions

- **Layout:** split-pane tree. `Split{dir,sz[],ch[]}` or `Pane{cs[],a}`. Cards live in leaves; several cards in one pane show as tabs.
- **Drag and drop:** drag a tab to a pane. Center or tab strip adds as a tab; top/bottom/left/right split the pane. Keyboard alternative ("Move to…") required. Layout changes are undoable.
- **Cards for 1.0:** Note, Markdown, List, Table, Tasks, Calendar, Calculator, Image, plus Assistant.
- **Cut:** Web card, Library card, Properties card, fixed grid / merge / span geometry.
- **Assistant modes:** Ask (no workspace context sent), Plan (reads chosen cards, proposes actions with diff preview, applied on approval), Create (applies actions directly, undoable). Default: Ask.
- **Providers:** Anthropic, Gemini, OpenAI-compatible with custom base URL. Keys stay local and are never exported. Actions via tool calling, validated against card schemas.
- **Look:** neutral surfaces, SVG icons, Inter (self-hosted for the offline build) plus a mono font, neutral blue accent, light/dark following the system, design tokens, hover-revealed controls, slim top bar, command palette (Ctrl/Cmd+K).
- **Data:** `.appdeck` format with lossless per-card JSON, no API keys. Autosave to IndexedDB. One `commit()` path for autosave, undo and dirty-marking. Card content is kept apart from layout history.

## "Familiar app" checklists

| Card | Model | Must have |
| --- | --- | --- |
| Note | Apple Notes / Keep | Rich text, checklists, links, `/` menu, paste images, autosave. Use a real editor, not `execCommand`. |
| Markdown | Obsidian / Typora | Live preview, code highlight, clickable checkboxes, tables, sanitized output. Consider merging with Note. |
| List | Apple Reminders | Complete, nest, reorder by drag, collapse, clear completed. |
| Table | Sheets / Excel | Selection, formulas (`=SUM` etc.), TSV paste, column types, sort/filter, frozen header, fill-down, CSV in/out. |
| Tasks | Trello / Linear | List and board views, drag between statuses, priority, due, assignee, saved filters. |
| Calendar | Google Calendar | Month/week/day with time grid, drag to create and resize, recurrence, ICS in/out. |
| Calculator | iOS Calculator | Keyboard input, history, safe parser (no `Function()`), optional scientific mode. |
| Image | Preview / Photos | Zoom/pan, rotate, gallery, paste/drag in, download. |

## Milestones (update status as work completes)

| # | Scope | Status |
| --- | --- | --- |
| M1 | Shell and workspace: tokens, top bar, command palette, split-pane engine, drop-zone drag and drop, pane tabs, layout undo | **Done and accepted.** File: `appdeck-0.5.0-m1.html` |
| M2 | Data core: card registry with schemas, `commit()`, IndexedDB autosave, `.appdeck` format, round-trip tests | **Done and accepted.** File: `appdeck-0.6.0-m2.html` (9/9 in-page tests pass in browser) |
| M3 | Assistant: adapters, Ask/Plan/Create, tool-call actions, diff preview, @-mentions, streaming | **Done and accepted.** File: `appdeck-0.7.5-m3.html` |
| M4 | Cards in order: Table, Tasks, Note/Markdown, Calendar, List, Calculator, Image | **In progress.** 4.1 Table built: `appdeck-0.8.6-m4.html` (0.8.5 passed 31/31 in browser; 0.8.6-m4 checks pending). Next: Tasks |
| M5 | Hardening: sanitization, accessibility, browser matrix, e2e smoke tests | Not started |

## Known gaps (carry into M3+)

- Cards are placeholders. Card content is stored beside the layout so undo never rolls back text.
- No drag to another workspace tab; no tab reordering inside a pane.
- No keyboard path for moving cards yet.
- Inter loads from Google Fonts; self-host for offline.

## Decision log (newest last; add an entry for every design choice)

| # | Milestone | Decision | Why |
| --- | --- | --- | --- |
| D1 | M2 | One `commit()` path: history, dirty mark, autosave, render. Card content stays outside layout history. | Lessons: undo gaps, silent storage failure. |
| D2 | M2 | `.appdeck` v1 is canonical JSON per card; keys scrubbed on write and read; loader repairs bad files. | Lessons: keys in exports, lossy save. |
| D3 | M3 | Provider settings and keys live in their own IndexedDB record, never in state or exports. | Keys never leave the browser. |
| D4 | M3 | Typed tools (`set_note`, `set_tasks`, `set_table`, `add_card`, `close_card`, `rename_card`), validated against card schemas and live cards. | Safer than a generic data blob; Gemini rejects empty object schemas. |
| D5 | M3 | AI actions put card content into the undo snapshot; normal typing stays outside undo. | Create mode must be undoable. |
| D6 | M3 | New cards never land in the assistant pane; if no other pane exists, one is split off. | User feedback. |
| D7 | M3 | After an apply: toast, tab dot, banner, changed rows/cells highlighted. | User feedback: show what the assistant touched. |
| D8 | M3.1 | Plan/Create send a title-only card index for all cards; contents only for `@mentioned` cards (`@all` = every card). **Approved by user.** | Lets the model update instead of duplicating, without reading everything. |
| D9 | M3.1 | `set_*` is rejected unless the card's contents were shared; duplicate adds flagged; Plan proposals flag cards edited since proposed ("Apply anyway"). | No blind overwrites; drift guard. |
| D10 | M3.2 | Cards are referred to as `<type>-<title>-<id>` in model context; chat text shows titles only; unshared cards the model asks for get a "Share and retry" button. | User feedback: ids are not human-friendly. |
| D11 | M3 | Single model round per message (no tool-result loop). | Superseded by D12. |
| D12 | M3.3 | `@mentions` are optional. In Plan/Create the model sees the title-only index and calls `read_cards` for what it needs (max 2 rounds; contents return as plain text, so all providers behave alike). Reads are shown under the reply ("Read: …"). Ask still sends no workspace context. `set_*` needs a card to have been read. **Approved by user.** | The model should find relevant cards by reasoning, not by user syntax. |
| D13 | M3.3 | "Check consistency" uses a `report_inconsistency` tool, once per finding. Cards get an amber tab badge, a banner listing findings, highlighted rows/cells where a quote matches; chat lists each finding with go-to buttons, "Propose fixes" (hands off to Plan) and "Clear flags". A card can carry several findings. Notes show quotes in the banner only. | User feature request: visible, multi-finding consistency check. |
| D15 | M4.1 | Table formulas use an own tokenizer/parser (`+ - * / ^`, parentheses, A1 refs, ranges, `SUM AVG MIN MAX COUNT ABS ROUND`); no `eval`/`Function`. Errors show `#DIV/0 #CYCLE #REF #NAME #VALUE #ERR`. Raw formulas are stored; values are computed. | Lesson: safe parser. |
| D16 | M4.1 | Table schema is `{g, types[]}` (text/number per column). Structural edits (sort, add/delete row or column, paste, fill-down, clear, CSV import, type change) go through `commit` with content history, so they are undoable; typing stays outside undo. | Consistent with D5. |
| D17 | M4.1 | Sort rewrites a formula's references to its own row; deleting rows or columns does not rewrite references. Filter is a view only. Frozen header and A/1 gutter labels give the formula references. | Known limits, listed in backlog. |
| D18 | M4.1 | Assistant gets `append_rows` and `update_cell` (A1) for small table edits; both need the card to have been read and show a diff. | Fewer rewrites, exact change markers. |
| D19 | M4.1 | Table row/column actions live on the grid, not the toolbar: a `+ Add row` bar under the last row, a `+` header after the last column, and hover controls on each column letter (sort toggle ↕/▲/▼, ✕ delete) and row number (✕ delete). Deleting with a full row or column range selected removes the whole range. Controls stay visible for the selected row/column (touch). Toolbar keeps column type, filter and CSV. | User feedback: more intuitive, standard spreadsheet UX. |
| D20 | M4.1 | Deleting rows/columns is two-step: click a row number or column letter (shift-click extends), then press Delete/Backspace or click the ✕, which only appears on a selected header. A toast says how many were deleted. Delete on a cell range clears contents. | User feedback: ✕ was too easy to hit by accident. |
| D21 | M4.1 | Cell ranges: drag, shift-click, shift-arrows, column/row headers, corner = all. Ctrl/Cmd+C/X/V work on ranges (TSV, so spreadsheets interoperate); a dashed outline marks the copied range; Esc clears it. Pasting a copied range shifts formula references like a spreadsheet; one value pasted over a range fills it. | User feature request. |
| D22 | M4.1 | Row/column delete no longer has an inline ✕. Selecting a header shows a `⋯` menu (Delete N rows/columns in red, Clear contents), or press Delete; every delete shows a toast with an Undo button (7 s). | User feedback: the ✕ was still too easy to hit. |
| D23 | M4.1 | `render()` saves and restores scroll positions (card body, assistant messages, tab strip, note text) per pane; Tasks keeps its scroll when redrawn; the assistant sticks to the bottom only if you were already there. | Bug: scroll snapped to the top after any re-render. |
| D24 | M4.1 | Workspaces can be renamed and deleted from a `⋯` button on the active tab, right-click on a tab, or the palette. Delete asks for confirmation (shows the card count), keeps at least one workspace, and offers Undo in a toast. Workspace tab reordering stays in the backlog. | Pulled forward from backlog by user request. |
| D25 | M4.1 | Typing in card fields (table cells, notes, task text, checkboxes, adding/removing a task) is now undoable: one snapshot per burst of typing in the same field (under 1 s apart), taken before the edit. Ctrl/Cmd+Z and Shift+Z work while a card field has focus; other inputs (assistant message, palette, rename) keep native undo. Supersedes the "typing stays outside undo" part of D5/D16. | User report: undo/redo not functioning (the toolbar stayed greyed out after edits); legacy lesson "undo gaps". |
| D26 | M4.1 | Default layout is **Workbench**: assistant (main) on the left, two panes top right, one bottom right. It is the first-run workspace, every new workspace (with an Assistant card in the main pane and three empty panes), and a palette preset. | User feature request. |
| D27 | M4.1 | Junction anchors: a handle sits where a vertical and a horizontal divider meet (T or +, including aligned dividers in different splits); dragging moves all of them together, double-click evens them out; undoable. Geometry is read from the rendered dividers. | User feature request. |
| D28 | M4.1 | Table column and row headers show a `▾` menu on hover (no selection needed): column: sort A→Z / Z→A, type, insert left/right, clear, delete (red); row: insert above/below, clear, delete (red). The `↕` one-click sort toggle stays. | User feature request. |
| D29 | M4.1 | Workspace rename uses an inline text box (double-click a tab, `⋯` menu, right-click, or palette), not `contentEditable`, so it works in every browser. | User feature request (rename existed; made reliable). |
| D30 | M4.1 | The table column `▾` menu sits at the right edge of the header, apart from the letter and the sort toggle. | User feedback. |
| D31 | M4.1 | Junction anchors are hidden until hovered (like the divider highlight); while dragging, the anchor follows the pointer. | User feedback. |
| D32 | M4.1 | A built-in **AppDeck MVP** workspace holds the brief as cards (Assistant, Latest iteration, Product and decisions, Milestones, Familiar-app checklists, Decision log, Backlog, Known gaps, Working agreements, Lessons). It is generated from this brief at build time and re-synced once per app version (tracked in its own IndexedDB record); edits to those cards are replaced on the next version. If the workspace is deleted it comes back on the next version. | User request: keep the project docs and each iteration's response inside the app. |
| D33 | M4.1 | Saved workspaces live in IndexedDB per browser and origin, so a new build opened in the same browser shows the old workspaces; this is autosave, not a cache bug. New palette commands: Export workspace as Markdown (for sharing context with Claude Code or this project) and Reset all workspaces to a fresh sample (asks first; provider settings are kept). | User question about stale tabs; support for the iteration loop. |
| D14 | process | The user allows fixes, features and issues to be placed in the current or a future milestone at Claude's discretion. | Keeps milestones coherent. |

## Backlog and open questions

**M4 (cards)**: real Table, Tasks, Note/Markdown, Calendar, List, Calculator, Image. Patch-style assistant tools (`append_rows`, `update_cell`, `append_items`, note find/replace) so edits are small and diffs and markers become exact. Table formulas keep totals inside one card. Changed-line highlight in notes needs the real editor.

**M4.1 follow-ups**: narrow-screen fallback for the 4-pane Workbench (M5); anchors can overlap a pane's tab buttons when a junction is dragged to the very top; rewrite formula references on row/column delete; drag-select and column resize; column formats (currency, percent, date); checkbox column type; CSV export should neutralise values starting with `=` for spreadsheets (M5 sanitization).

**M5 (hardening)**: cap or chunk `@all`; mock-model tests for update-versus-add and conflict handling; prompt regression tests; sanitization, accessibility, browser matrix.

**Later**: stale badges via card lineage; keyboard "Move to…"; tab reordering; cross-workspace drag; self-host Inter.

**Open questions**: none right now.
1. ~~On-demand card reading~~ resolved by D12.
2. ~~Table headers in the card index~~ not needed; the model reads cards on demand (D12).

## Working agreements

- Small vertical slices. Every checkpoint is one runnable file, version-tagged (`0.x.y` until 1.0.0), with a one-line changelog.
- Separate modules with narrow interfaces: `store`, `layout`, `cards/*`, `assistant/*`, `persist`. Bundle to one HTML file at the end.
- Contracts first: card schema and action format before UI.
- A milestone is done when its tests pass. Add a tiny in-page test runner starting with layout-tree operations and a save/load round trip.
- Unfinished features sit behind flags that are off by default.
- Write each module once, then use targeted edits instead of regenerating whole files.
- Update milestone status, the decision log and the backlog here after each checkpoint.

## Resume protocol

1. Attach the latest build file to the project.
2. Read this brief and find the first unfinished milestone.
3. Continue there. Do not re-open locked decisions unless asked.

## Lessons from legacy v0.1.x (do not repeat)

- **Keys in exports.** API keys were written into saved files. Never export keys and never load them from files.
- **XSS.** Markdown tables were injected before escaping, `javascript:` links were allowed, loaded note HTML was trusted, and the iframe used `allow-scripts` with `allow-same-origin`. Sanitize all rendered content and restrict link schemes.
- **Lossy save.** Calendar events and rich text did not survive the package round trip. Store canonical JSON per card.
- **Assistant blindness.** "UNCHANGED" stubs in a stateless API meant the model lost card contents after turn one. Always send needed context.
- **Unvalidated AI edits.** `Object.assign` of model output into card data. Validate every action against a schema.
- **Undo gaps.** Layout and cell edits were not covered by undo.
- **Silent storage failure.** Quota errors were swallowed. Surface them.
- **Fragility.** Merge zones, span picker and per-card geometry were the most bug-prone code. The split tree replaces them.
- **Version drift.** One version constant, semver.

## Suggested project instructions (paste into the new project)
>
> You are building AppDeck 1.0 using APPDECK-1.0-PROJECT-BRIEF.md as the source of truth. Work one milestone at a time, deliver a single version-tagged HTML file per checkpoint, keep modules separate, and update the milestone table after each one. Ask before changing a locked decision.
