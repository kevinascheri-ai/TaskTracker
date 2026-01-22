# Task Tracker

A keyboard-first daily task tracker with an extreme sports aesthetic. Bold, fast, no BS.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

### Daily Lists
- Each day has its own task list
- Incomplete tasks **carry over** to the next day automatically
- Past days are **read-only** — review what you crushed

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` or `A` | Add new task |
| `J` / `K` | Navigate up/down |
| `X` or `Space` | Toggle complete |
| `E` or `Enter` | Edit task |
| `D` or `Backspace` | Delete task |
| `1` `2` `3` `4` | Set priority P0-P3 |
| `⌘↑` / `⌘↓` | Reorder task |
| `Esc` | Close modal / deselect |

### Priority Levels
- **P0** - Critical (red)
- **P1** - High (orange)  
- **P2** - Normal (cyan)
- **P3** - Low (gray)

## Features

✅ Day-based task management  
✅ Auto carryover for incomplete tasks  
✅ Modal-based add/edit (no inline clutter)  
✅ Full keyboard navigation  
✅ Visual priority badges  
✅ Completed tasks grouped separately  
✅ Celebration mode toggle 🔥

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- localStorage (IndexedDB-ready interface)

## Design

Extreme sports-inspired aesthetic:
- High contrast dark theme
- Neon accent colors
- Bold condensed typography (Bebas Neue)
- Angular/geometric UI elements
- No fluff, pure function

---

Press `N` to start. Get it done.
