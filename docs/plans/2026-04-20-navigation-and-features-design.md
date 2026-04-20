# Navigation & Features Design

## Overview
Add persistent navbar+sidebar navigation, cream/green theme, home hub screen, checkpoints list screen, and PIN-gated lucky draw screen with slot-machine animation.

## Navigation
- Top navbar: hamburger (left), app title (center), fairy icon (right)
- Slide-in sidebar (left) with dark green background, 6 items:
  1. Home (`/home`)
  2. Current Quest (`/game`)
  3. Checkpoints (`/checkpoints`)
  4. Map (`/map`)
  5. Leaderboard (`/leaderboard`)
  6. Lucky Draw (`/lucky-draw`)
- Sidebar overlays content with dark backdrop, closes on outside tap
- No navbar on Registration screen (pre-auth)

## Theme — Cream & Green
```
--bg:          #F5F0E8
--bg-card:     #FFFFFF
--bg-sidebar:  #1A3D2B
--green-glow:  #2D7A4A
--green-light: #E8F5EE
--gold:        #B8860B
--text:        #1C2B1E
--text-muted:  #6B7B6E
--error:       #C0392B
--border:      #D4E6D9
```

## Home Screen (`/home`)
- Floating fairy + "Welcome back, [name]!"
- Progress bar (X/10)
- Large "Current Quest" card (shows checkpoint number + riddle preview) → taps to `/game`
- 3 shortcut tiles: Map, Leaderboard, Lucky Draw

## Checkpoints List (`/checkpoints`)
- 10 rows, 3 states:
  - Done: green, checkmark, room name visible, tap shows riddle + "completed" badge
  - Current: gold highlight, pulsing dot, tap goes to `/game`
  - Locked: grey, room name shows "???", not tappable

## Lucky Draw (`/lucky-draw`)
- Shows count of eligible players (completed, not first place)
- PIN entry (organizer only) unlocks Draw button
- Draw plays slot-machine animation: names scroll fast → decelerate → 5 land
- Uses `crypto.getRandomValues()` for true randomness
- Winners highlighted green, rest greyed out
- Button locks after one draw
