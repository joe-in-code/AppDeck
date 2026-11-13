# AppDeck

**All your notes, lists, and plans in one place — in your browser. No install, no account, no cloud. Keep your thoughts and ideas your way, the context you care about intact — with an AI that builds alongside you, not one you delegate your memory, structure, and personal taste to.**

## The problem it solves

Your thinking is scattered across five apps: a notes app for ideas, a to-do app for tasks, a spreadsheet for the budget, a calendar for dates, and a folder of screenshots. Each wants an account, a subscription, and a sync you can't see. And now there's a sixth: the AI chat you ask for help, which starts every conversation from nothing and forgets your world the moment you close the tab.

AppDeck puts the pieces side by side in a single workspace you can see at once — and saves it all into one file that lives on your computer.

### Stop context switching — start context mastering!

## What it feels like to use

- **A workspace, not a feed.** Arrange cards side by side: a note next to your tasks, a table next to a calendar. Drag a tab to split the screen, or move a card from the menu if you'd rather not drag.
- **Cards that behave like apps you know.** A Note card is a note. A Table card is a table. A Tasks card is a checklist. Nothing new to learn.
- **One file.** Everything lives in a single `.appdeck` file. Open it in a browser. Copy it to a USB stick. Email it to yourself.
- **Offline by default.** It works with no internet. Nothing is uploaded anywhere.

## Things people use it for

| You want to… | Use a… |
|---|---|
| Jot down an idea or draft something | **Note** or **Markdown** card |
| Keep a running to-do list | **Tasks** card |
| Track a budget, a reading log, a project status | **Table** card |
| Plan the week or keep a schedule | **Calendar** card |
| Capture a screenshot or a photo | **Image** card |
| Do quick math without opening another app | **Calculator** card |
| Braindump and organize later | **List** card |

Put them together and it becomes a home base: a "Life admin" pane with your tasks and calendar, a "Writing" pane with notes and a word-count table, a "Trip" pane with an itinerary table, packing list, and photos.

## What AI chat apps get wrong — and what AppDeck does instead

The AI apps most people use are built around one long conversation. That shape causes the same handful of problems for everyone. AppDeck keeps the assistant, but changes the shape:

| The problem in most AI apps | What AppDeck does instead |
|---|---|
| **Every chat starts blank.** It has no idea what's in your notes, tasks or calendar, so you retype a summary every time. | It reads your real cards when it needs them — your actual budget, your actual to-do list — instead of what you remembered to paste in. |
| **Your work lives in their cloud**, behind an account, and is gone if the service has a bad day. | One file on your computer. No account. Works with the internet switched off. |
| **It edits and you find out afterwards** — or you can't tell what it changed. | Plan mode shows you exactly what it would change and waits for your OK. Every change keeps or reverts on its own. |
| **Everything is one long thread.** A recipe, a project plan and a poem all pile into the same scroll. | Cards. A note is a note, a table is a table, a calendar is a calendar — and the assistant works inside them. |
| **The assistant's numbers are made up** because it never sees your data. | It can only change what it has read, and it edits the card itself, so the total is the total. |
| **You can't take your data with you.** | Export the whole thing as a `.appdeck` file or as Markdown any time. |
| **Your key and your content go wherever they send it.** | You bring your own key, it stays on your machine, and it is never written into the file you back up or share. Card text is treated as data, never as instructions. |
| **A subscription, on top of everything else.** | The assistant is optional. Bring your own key, or don't use it at all — everything else keeps working. |

## It can help you fill it in

The built-in assistant can read your workspace and edit it for you — on request:

- **Ask** — plain questions, with no access to your cards. The default.
- **Plan** — it reads the cards you choose, shows you exactly what it would change, and waits for your OK before touching anything.
- **Create** — it makes the changes directly; you can undo them.

You bring your own AI key. It stays on your machine and is never written into your saved file.

## Your stuff stays yours

- **No account, no sign-up, no server.** It's a single file that runs in your browser.
- **No secrets in the file.** Your API keys are never saved into the document you share or back up.
- **Autosave.** Your work is saved as you go, and undo covers layout changes as well as your typing.
- **Rendered content is cleaned up** before it's shown, so a pasted link or snippet can't do anything sneaky.

## Honest about what's not done yet

- It's in testing (version 0.22.0), not a finished 1.0.
- The look on narrow phone screens and touch dragging still need work — it's happiest on a desktop with a keyboard.
- Some finishing touches (offline fonts, dictation phase two) are still in progress.

## Try it

Open the `.appdeck` file in your browser. That's the whole setup.

---

# Under the hood

Everything below is for people who want to build on it, audit it, or help out. If you just want to use AppDeck, you can stop reading here.

## What it is, precisely

A small set of cards that behave like the apps people already know, arranged in a split-pane workspace, with an assistant that can read and edit the workspace on request. Everything lives in one self-contained `.appdeck` file that opens in a browser with no install and no server.

## Core promise

- Familiar cards, not novel ones: each card behaves like common apps it replicates.
- A split-pane workspace you arrange by dragging tabs, with keyboard alternatives.
- An assistant that can read the workspace and act on it, on request.
- One file. Offline. No keys in the file.

## Cards

For 1.0: **Note, Markdown, List, Table, Tasks, Calendar, Calculator, Image**, plus the **Assistant**.

## Workspace and layout

- Layout is a split-pane tree: `Split{dir,sz[],ch[]}` or `Pane{cs[],a}`. Cards live in leaves; several cards in one pane show as tabs.
- Drag a tab onto a pane: center or the tab strip adds it as a tab; top/bottom/left/right splits the pane.
- A keyboard equivalent (**Menu > Card > Move to…**, or the command palette) is required, not optional.
- Layout changes are undoable. Card content is stored apart from layout history, so undo never rolls back text.

## Assistant, in detail

Three modes:

| Mode | Behavior |
|---|---|
| **Ask** (default) | No workspace context is sent. |
| **Plan** | Reads chosen cards, proposes actions with a diff preview, applies on approval. |
| **Create** | Applies actions directly; still undoable. |

- Actions run through tool calling and are validated against card schemas — model output is never merged blindly.
- Card text is treated as data, never as instructions.
- Providers: Anthropic, Gemini, and OpenAI-compatible endpoints with a custom base URL. API keys stay local and are never exported.

## Look

Neutral surfaces, SVG icons, Inter (self-hosted for the offline build) plus a mono font, a neutral blue accent, light/dark following the system, design tokens, hover-revealed controls, a slim top bar, and a command palette (`Ctrl/Cmd+K`).

## Data

- `.appdeck` format with lossless per-card JSON. No API keys.
- Autosave to IndexedDB. A single `commit()` path covers autosave, undo, and dirty-marking.
- Loads are size-limited (workspaces, cards, rows, text) so a bad file cannot freeze the tab.

## Milestones

| # | Scope | Status |
|---|---|---|
| M1 | Shell and workspace: tokens, top bar, palette, split-pane engine, drag and drop, pane tabs, layout undo | Done and accepted |
| M2 | Data core: card registry with schemas, `commit()`, IndexedDB autosave, `.appdeck` format, round-trip tests | Done and accepted |
| M3 | Assistant: adapters, Ask/Plan/Create, tool-call actions, diff preview, @-mentions, streaming | Done and accepted |
| M4 | Cards in order: Table, Tasks, Note/Markdown, Calendar, List, Calculator, Image (+ dock, search, archive/catalog, menus) | Built and accepted |
| M5 | Hardening: sanitization, accessibility, browser matrix, e2e smoke tests | In progress |

## Development

- **Small vertical slices.** Every checkpoint is one runnable file, version-tagged (`0.x.y` until `1.0.0`), with a one-line changelog.
- **Separate modules, narrow interfaces:** `store`, `layout`, `cards/*`, `assistant/*`, `persist`. Bundle to a single HTML file at the end.
- **Contracts first:** card schema and action format before UI.
- **A milestone is done when its tests pass.** In-page test runner, started with layout-tree operations and a save/load round trip.
- **Unfinished features sit behind flags that are off by default.**
- Write each module once, then use targeted edits instead of regenerating whole files.
- After each checkpoint, update milestone status, the decision log, the backlog, the version history, and the version stamp so the brief and the build agree.

**Tests:** open the file, then **Menu > Help > Run tests** (93/93 expected in 0.22.0-m5). A headless smoke runner, `appdeck-smoke.js`, is available for developers.

## Known limits

- Browser matrix (Chrome, Edge, Firefox, Safari) and screen-reader passes are still to run.
- Narrow-screen layout for the four-pane Workbench, and touch alternatives to dragging.
- Speech-to-text phase 2 (behind a flag, off by default); self-host Inter; cap or chunk `@all`; assistant regression tests; tab reordering.

## Security notes carried over from legacy v0.1.x

These shaped the current design and are easy to regress:

- **Never export keys**, and never load them from files.
- **Sanitize all rendered content** and restrict link schemes (`javascript:` links and pre-escape table injection were both real bugs).
- **Store canonical JSON per card** — calendar events and rich text must survive the round trip.
- **Validate every assistant action against a schema**, never `Object.assign` model output into card data.
- **Cover layout and cell edits with undo**, and **surface storage-quota errors** instead of swallowing them.