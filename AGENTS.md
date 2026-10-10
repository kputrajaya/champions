# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Marvel Champions Token Tracker — a static web app for tracking game state (health, threat, status effects) while playing the Marvel Champions board game. Hosted on Vercel.

## Development

No build process. Open `index.html` directly in a browser, or serve locally:

```bash
npx serve .
# or
python -m http.server
```

No package manager, no compilation step. All dependencies load via CDN (Alpine.js, Bootstrap).

## Architecture

Three files:

- **`index.html`** — markup and Alpine.js templates (`x-for`, `x-show`, `x-if`, `@click`)
- **`site.js`** — single Alpine.js component (`mct`) with all reactive state and logic
- **`site.css`** — Bootstrap overrides and custom styles

### State Model

`site.js` exposes one Alpine data component (`Alpine.data('mct', ...)`) with a `state` object persisted to localStorage via `$persist()`. State contains:

- `villain` — villain entity with health, minions, schemes
- `heroes[]` — 1–4 hero objects, each with health, allies, minions, cards, status effects
- `firstPlayer` — index for multiplayer turn tracking
- `modal` — inline editing state (edit/add dialogs)

Status effects (tough, stunned, confused) are boolean flags on entities. Counters track numeric ability values.

### Sync

Real-time multi-user sync via a custom PubSub WebSocket SDK loaded from `kputrajaya.github.io`. State changes broadcast to all connected clients in the same session.

### Editing Pattern

All add/edit operations go through a modal: clicking edit deep-copies the target entity into `modal.data`, the user edits, then saves back. Deep copy utility prevents mutating live state before confirmation.
