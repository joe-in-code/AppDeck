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
| M2 | Data core: card registry with schemas, `commit()`, IndexedDB autosave, `.appdeck` format, round-trip tests | Not started |
| M3 | Assistant: adapters, Ask/Plan/Create, tool-call actions, diff preview, @-mentions, streaming | Not started |
| M4 | Cards in order: Table, Tasks, Note/Markdown, Calendar, List, Calculator, Image | Not started |
| M5 | Hardening: sanitization, accessibility, browser matrix, e2e smoke tests | Not started |

## M1 known gaps (carry into M2+)

- Cards are placeholders. Card content is stored beside the layout so undo never rolls back text.
- No drag to another workspace tab; no tab reordering inside a pane.
- No keyboard path for moving cards yet.
- Inter loads from Google Fonts; self-host for offline.
- Persistence is `localStorage`; move to IndexedDB in M2.

## Working agreements

- Small vertical slices. Every checkpoint is one runnable file, version-tagged (`0.x.y` until 1.0.0), with a one-line changelog.
- Separate modules with narrow interfaces: `store`, `layout`, `cards/*`, `assistant/*`, `persist`. Bundle to one HTML file at the end.
- Contracts first: card schema and action format before UI.
- A milestone is done when its tests pass. Add a tiny in-page test runner starting with layout-tree operations and a save/load round trip.
- Unfinished features sit behind flags that are off by default.
- Write each module once, then use targeted edits instead of regenerating whole files.
- Update milestone status here after each milestone.

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
