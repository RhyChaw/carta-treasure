# 🌴 Lost in the Office Jungle — Treasure Hunt App

## Complete Build Context

> **Purpose of this document:** This is a comprehensive specification for building an office treasure hunt web app. Feed this entire document to a coding agent to build the project end-to-end. Every decision has been made — just build it.

---

## 1. PROJECT OVERVIEW

### What is this?
An end-of-term office event for 20–40 participants. Players use their phones to navigate a treasure hunt through the office building. They solve riddles to find rooms, scan QR codes hidden in those rooms, complete mini-challenges unlocked by the QR codes, enter passphrases to clear checkpoints, and race to finish first.

### Narrative Theme
All meeting rooms in the office are named after plants/trees. The story: **players are explorers lost in an office jungle, guided by a fairy mascot, searching for a magical orb.** Each checkpoint is a waypoint deeper into the jungle. The fairy speaks through the app — riddles, hints, success/failure messages are all her dialogue.

### Win Conditions
- **First to complete all 10 checkpoints:** Wins a **special prize** and is EXCLUDED from the lucky draw.
- **Everyone else who completes all 10:** Enters a **lucky draw** for additional prizes.
- **Incomplete players:** Don't qualify for anything, but can keep playing.

---

## 2. TECH STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React (Vite) | Single-page app, mobile-first design |
| Hosting | Netlify | Free tier. Drag-and-drop deploy or CLI. URL shared via Slack. |
| Database | Supabase | Free tier. Postgres + real-time subscriptions for live leaderboard. |
| QR Scanning | Browser BarcodeDetector API | Fallback: manual code entry text field |
| Office Map | Static PNG image | Exported from Envoy. Overlaid with interactive checkpoint pins. |
| Mascot Assets | PNG sprite sheet | Character sheet provided (see assets section). |

### Supabase Schema

```sql
-- Players table
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  start_time TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ, -- NULL until they finish all 10
  is_first_place BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 0 -- 0-indexed, 0 = hasn't started checkpoint 1 yet
);

-- Progress table (tracks each checkpoint completion)
CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  checkpoint_index INTEGER NOT NULL, -- 0–9
  room_id TEXT NOT NULL, -- e.g., 'MAPLE'
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, checkpoint_index)
);

-- Enable real-time on both tables
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE progress;

-- Leaderboard view (only completed players, ranked by time)
CREATE VIEW leaderboard AS
SELECT
  p.id,
  p.name,
  p.start_time,
  p.completed_at,
  p.is_first_place,
  EXTRACT(EPOCH FROM (p.completed_at - p.start_time)) AS time_seconds
FROM players p
WHERE p.completed_at IS NOT NULL
ORDER BY p.completed_at - p.start_time ASC;
```

**First-place logic:** When a player completes checkpoint 10 (the final one), check if any other player has `completed_at IS NOT NULL`. If no one else has finished, set `is_first_place = true` for this player.

### Auth Strategy
**No traditional auth.** This is a fun office event, not a production app.
- Player enters their name on the registration screen.
- A player row is created in Supabase.
- The player UUID is stored in the browser's sessionStorage.
- If someone clears their browser, they can re-register or use a "I already registered" flow that shows a list of names to pick from (honor system).

---

## 3. GAME FLOW (Step by Step)

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. REGISTER                                                        │
│     Player opens URL on phone → enters explorer name → timer starts │
├─────────────────────────────────────────────────────────────────────┤
│  2. RIDDLE                                                          │
│     Fairy mascot presents a jungle-themed riddle hinting at the     │
│     NEXT room to visit. Player must figure out which room.          │
├─────────────────────────────────────────────────────────────────────┤
│  3. NAVIGATE                                                        │
│     Player physically walks through the office to find the room.    │
│     Interactive map with pins available for reference.               │
├─────────────────────────────────────────────────────────────────────┤
│  4. FIND THE QR CODE                                                │
│     QR code is HIDDEN in the room (behind a chair, under a table,  │
│     taped to the bottom of a whiteboard, etc.). Player must search. │
├─────────────────────────────────────────────────────────────────────┤
│  5. SCAN → MINI CHALLENGE                                           │
│     Scanning the QR code opens a CHALLENGE (not just a checkmark).  │
│     Challenge types vary: Bracket City, math, cipher, GeoGuessr,   │
│     emoji decode, rebus, etc.                                       │
├─────────────────────────────────────────────────────────────────────┤
│  6. SOLVE → PASSPHRASE                                              │
│     Completing the challenge reveals a PASSPHRASE (word or number). │
│     Player types the passphrase into the main app.                  │
├─────────────────────────────────────────────────────────────────────┤
│  7. CHECKPOINT CLEARED                                              │
│     App validates passphrase → marks checkpoint complete →           │
│     shows next riddle. Repeat from step 2.                          │
├─────────────────────────────────────────────────────────────────────┤
│  8. WRONG ROOM SCAN                                                 │
│     If player scans a QR code from the WRONG room, they get a      │
│     "lost in the jungle" message. They do NOT advance. They do NOT  │
│     see the challenge for that room. They stay on their current     │
│     riddle. This prevents brute-forcing by scanning everything.     │
├─────────────────────────────────────────────────────────────────────┤
│  9. COMPLETION                                                      │
│     After clearing checkpoint 10, player sees victory screen.       │
│     If first to finish → special prize screen (excluded from draw). │
│     Otherwise → lucky draw entry confirmation.                      │
├─────────────────────────────────────────────────────────────────────┤
│  10. MEGA FINALE (Checkpoint 10 only)                               │
│      Last challenge directs player to the organizer's desk.         │
│      Physical safe is there. Solving the mega challenge gives       │
│      the combination. Inside the safe = winner chit for the prize.  │
└─────────────────────────────────────────────────────────────────────┘
```

### QR Code Format
Each QR code encodes a simple string:
```
JUNGLE_HUNT_{ROOM_ID}
```
Examples: `JUNGLE_HUNT_MAPLE`, `JUNGLE_HUNT_OAK`, `JUNGLE_HUNT_LIBRARY`

These will be printed on cards and physically taped/hidden in each room. Each card should also have:
- The fairy mascot image
- A small jungle-themed border
- The code printed as text below the QR (for manual entry fallback)

### Wrong Room Behavior
- Player scans QR code from ANY room that is NOT their current target.
- App shows fairy mascot in a worried/lost pose.
- Message: *"The spirits here don't welcome us yet... we must look elsewhere, explorer."*
- Player stays on their current checkpoint. No advancement. No leaking of the challenge for the scanned room.
- This is critical: it prevents someone from just running around scanning every room.

---

## 4. THE 10 CHECKPOINTS — ROOMS, CHALLENGES & PASSPHRASES

### Path Order (designed to zigzag across the office, preventing crowding)

The path intentionally sends players back and forth across the floor rather than clearing one section at a time:

| # | Room | Area on Map | Challenge Type | Difficulty |
|---|------|-------------|---------------|------------|
| 1 | Clover | Center (middle of three sisters) | Easy | ⭐ |
| 2 | Ash | East side, large room, north | Medium | ⭐⭐ |
| 3 | Maple | Center-north, large conf room | Hard | ⭐⭐⭐ |
| 4 | Orchid | Far east, near First Aid | Easy | ⭐ |
| 5 | Hickory | East side, large room, south | Medium | ⭐⭐ |
| 6 | Glasgow | Far northwest corner | Hard | ⭐⭐⭐ |
| 7 | Iris | South side, near Library | Easy | ⭐ |
| 8 | Violet | Far northeast, near entrance | Medium | ⭐⭐ |
| 9 | Cherry | East side, large room, middle | Hard | ⭐⭐⭐ |
| 10 | Library | South side | 🔥 MEGA FINALE | ⭐⭐⭐⭐ |

**Difficulty rhythm:** Easy → Medium → Hard → Easy → Medium → Hard → Easy → Medium → Hard → MEGA

---

### Checkpoint 1: CLOVER (Easy ⭐)
**Riddle (pointing player to Clover):**
> *"Lucky are those who seek the middle sister. Three rooms stand in a row on the jungle floor — not the first, not the last, but the one fortune favors."*

**QR hidden:** Under the conference table in Clover.

**Challenge type:** Emoji Decode
**Challenge:** Displayed on a webpage opened by the QR:
> Decode these emoji equations. The answer to the last one is your passphrase.
> - 🌳 + 🔥 = ASH *(example, shown solved)*
> - 🌸 + 🐝 = HONEY *(example, shown solved)*
> - 🍀 + 4️⃣ = ?

**Passphrase:** `LUCK`
**Explanation:** Four-leaf clover = luck.

---

### Checkpoint 2: ASH (Medium ⭐⭐)
**Riddle (pointing player to Ash):**
> *"From the ashes of the old jungle, a mighty chamber arose. It watches over the training grounds where warriors test their strength. Seek the largest room near the northern fighting pit."*

**QR hidden:** Taped behind the room's monitor/screen.

**Challenge type:** GeoGuessr (Office Edition)
**Challenge:** Webpage shows a zoomed-in, slightly cropped photo of a specific spot INSIDE the office (e.g., a particular poster, a unique desk decoration, the gym entrance sign — something identifiable but not obvious). Player must figure out what/where it is.
> *"The fairy's memory is fading... she remembers seeing this place. What room or area is shown in this image? Type its name."*

**Passphrase:** `[DEPENDS ON PHOTO CHOSEN — organizer decides]`
**Note to organizer:** Take a tricky photo of somewhere recognizable in the office before the event. The answer is the name of the location/room shown.

---

### Checkpoint 3: MAPLE (Hard ⭐⭐⭐)
**Riddle (pointing player to Maple):**
> *"The grandest canopy in the jungle — a round gathering place where the elders once convened. Its leaf adorns a distant nation's flag. Find the great circle table."*

**QR hidden:** Taped under one of the chairs around the large round conference table.

**Challenge type:** Bracket City Tournament
**Challenge:** QR links to a Bracket City game. Theme suggestion: **"Best Office Snack"** or **"Best Jungle Animal"** — a fun bracket tournament. The final winning item's name (or a derivative of it) is the passphrase.
> After completing the bracket, the final screen shows: *"The jungle spirits declare [WINNER] supreme! Your passphrase is: [PASSPHRASE]"*

**Passphrase:** `[SET BY ORGANIZER — depends on bracket outcome]`
**Note to organizer:** Pre-configure the Bracket City tournament so it always resolves to the same winner regardless of player choices (fixed bracket), OR make the passphrase the name of the winning category. You need a deterministic outcome.

---

### Checkpoint 4: ORCHID (Easy ⭐)
**Riddle (pointing player to Orchid):**
> *"Exotic and rare, the jungle's most prized bloom grows near where the healers rest. Seek the flower closest to the place of first aid."*

**QR hidden:** Behind the door of the Orchid room.

**Challenge type:** Rebus Puzzle
**Challenge:** Webpage shows a rebus (picture puzzle) that spells out a word/phrase.
> Example: 🖼️ EYE + 🖼️ LAND = ISLAND
> The actual rebus should resolve to the passphrase.

**Passphrase:** `[SET BY ORGANIZER based on rebus design]`
**Note to organizer:** Design 2–3 rebus image puzzles. The final answer word is the passphrase. Keep it single-word for easy entry.

---

### Checkpoint 5: HICKORY (Medium ⭐⭐)
**Riddle (pointing player to Hickory):**
> *"Tough as old bark and smoky in legend, this tree's wood has fueled a thousand jungle campfires. Seek the southern sibling of Cherry and Ash on the jungle's eastern ridge."*

**QR hidden:** Under the table or behind a whiteboard.

**Challenge type:** Google Research Puzzle
**Challenge:** Webpage shows:
> *"The fairy found a torn page from an ancient text. It reads: 'The author who wrote [SPECIFIC BOOK TITLE] was born in a city. That city's name is your passphrase.'"*

**Passphrase:** `[CITY NAME — organizer picks a book and its author's birthplace]`
**Note to organizer:** Pick an interesting but not-too-obscure book. The player must Google the author and find their birthplace. Example: "The author of *The Alchemist* was born in which city?" → `RIODEJANEIRO` or `RIO`. Decide on exact formatting.

---

### Checkpoint 6: GLASGOW (Hard ⭐⭐⭐)
**Riddle (pointing player to Glasgow):**
> *"Not a flower, not a tree — a faraway human settlement at the jungle's forgotten edge. Travel to the farthest northwest outpost, where the dishwashing river flows nearby."*

**QR hidden:** Inside a drawer or under a seat cushion in Glasgow.

**Challenge type:** Cipher Decoding
**Challenge:** Webpage displays an encoded message and a cipher key (e.g., Caesar cipher, substitution cipher, or a custom key).
> *"The fairy intercepted a coded message from the jungle spirits. Decode it to proceed."*
> Encoded text: `WKHBXQJOHLVDOLYH`
> Key: Each letter shifted back by 3 (Caesar cipher, shift 3)

**Passphrase:** `THEJUNGLEISALIVE` (or a simpler decoded phrase)
**Note to organizer:** Choose your cipher type and encoded message. Caesar cipher (shift N) is accessible but still feels clever. For harder: use a substitution cipher with a key printed on a physical card placed in the room.

---

### Checkpoint 7: IRIS (Easy ⭐)
**Riddle (pointing player to Iris):**
> *"The rainbow goddess planted her flower in the southern gardens, beside the ancient hall of knowledge. Seek the colorful bloom near the Library."*

**QR hidden:** Taped to the underside of a shelf or behind a plant pot.

**Challenge type:** Sequence Completion
**Challenge:** Webpage shows:
> *"Complete the jungle sequence. The missing flower is your passphrase."*
> Maple, Oak, Pine, ?, Ash
> *(Hint: look at the map...)*

**Passphrase:** `WALNUT`
**Explanation:** These rooms appear in geographical order on the map from west to east/north to south in a specific cluster. Player can reference the map to figure out which room fits in the gap.

---

### Checkpoint 8: VIOLET (Medium ⭐⭐)
**Riddle (pointing player to Violet):**
> *"Shrinking and shy, a tiny purple bloom hides in the jungle's far northeast corner, high above where explorers enter and exit."*

**QR hidden:** Behind the door or under the desk in Violet.

**Challenge type:** CARTA Word Challenge
**Challenge:** Webpage shows:
> *"The fairy needs you to prove your linguistic powers! Using ONLY the letters C, A, R, T, A — how many valid English words can you form? (Minimum 3 letters each. 'CARTA' counts as a valid word.) Type the NUMBER as your passphrase."*

**Passphrase:** `[NUMBER — organizer must pre-determine the official count]`

**Official word list (organizer reference):**
- 3 letters: ARC, ART, CAR, CAT, RAT, TAR, ACT
- 4 letters: CART, TARA, ACRE (wait — no E), CARAT (5 letters, only one A... no, C-A-R-A-T uses both A's!) 
- 5 letters: CARTA, CARAT

**Organizer TODO:** Finalize the exact word list and count. Be strict about what counts (no proper nouns except CARTA if you allow it). Suggestion: the answer is likely around **9–11** valid words. Pick the number and make it the passphrase.

---

### Checkpoint 9: CHERRY (Hard ⭐⭐⭐)
**Riddle (pointing player to Cherry):**
> *"Sweet blossoms fall like pink rain in the middle of the eastern ridge. Between the Ash summit above and the Hickory valley below, the cherry grove blooms eternal."*

**QR hidden:** Taped under a chair seat or behind the TV/monitor.

**Challenge type:** Age/Math Trick Puzzle
**Challenge:** Webpage shows:
> *"The fairy poses a riddle of time:"*
>
> "A jungle elder is 3 times as old as her apprentice today. In 12 years, she will be exactly twice the apprentice's age. How old is the elder RIGHT NOW? The elder's current age is your passphrase."

**Solution:** Let apprentice = x. Elder = 3x. In 12 years: 3x + 12 = 2(x + 12). → 3x + 12 = 2x + 24 → x = 12. Elder = 36.

**Passphrase:** `36`

---

### Checkpoint 10: LIBRARY (🔥 MEGA FINALE ⭐⭐⭐⭐)
**Riddle (pointing player to Library):**
> *"Your journey nears its end, brave explorer. All jungle knowledge flows to one sacred place — the ancient archive where wisdom sleeps. Go to where books live... and find the fairy's final trial."*

**QR hidden:** Inside a book on the Library shelf (between specific pages — organizer decides which book).

**Challenge type:** MEGA CHALLENGE — Multi-step + Physical Safe
**Challenge:** QR links to a page that says:
> *"You've proven yourself worthy, explorer. But the magical orb is locked in an ancient safe. To open it, you must complete the fairy's FINAL trial. Go to [ORGANIZER NAME]'s desk. The fairy guardian awaits."*

At the organizer's desk, the player receives the mega challenge (this can be a physical puzzle, a riddle spoken by the organizer, a combination lock challenge, or whatever the organizer prepares). Solving it gives the **combination to a physical safe** sitting on or near the desk. Inside the safe is a **winner chit** that the player presents to claim their prize.

**Passphrase:** `[SAFE COMBINATION or a word given by the organizer after solving]`

**Note to organizer:** This is YOUR moment. You are the final fairy guardian. Design whatever mega challenge you want — it could be a series of riddles, a physical puzzle box, a trivia gauntlet, anything. The safe combination is the final payoff. First person to open it takes the chit.

---

## 5. OFFICE MAP DETAILS

### Map Asset
- **File:** `Screenshot_2026-04-17_at_4_55_56_PM.png` (provided)
- **Source:** Envoy office map
- **Usage:** Displayed as a pannable/zoomable background image in the app with checkpoint pins overlaid

### All Rooms Visible on Map (for reference)

**Vegetation-named rooms (meeting rooms):**
| Room | Approximate Position (x%, y% from top-left) | Size |
|------|----------------------------------------------|------|
| Glasgow | 4.5%, 4% | Small |
| Weber | 11%, 5% | Small |
| Maple | 44%, 14% | Large (round table) |
| Oak | 57.5%, 18% | Small-medium |
| Pine | 57.5%, 28% | Small |
| Walnut | 57.5%, 36% | Small |
| Ash | 71.5%, 12% | Large |
| Cherry | 71.5%, 27% | Large |
| Hickory | 71.5%, 40% | Large |
| Bunchberry | 41%, 37% | Medium |
| Clover | 46%, 37% | Medium |
| Dandelion | 50%, 37% | Medium |
| Iris | 68.5%, 52% | Medium |
| Lily | 73%, 52% | Medium |
| Mayflower | 77.5%, 52% | Medium |
| Violet | 84%, 7% | Small |
| Trillium | 84%, 15% | Small |
| Rose | 84%, 23% | Small |
| Poppy | 84%, 31% | Small |
| Orchid | 84.5%, 38% | Small |
| Library | 64%, 49% | Medium |

**Non-game rooms visible on map (for context, NOT checkpoints):**
- Dishwashing Room, IT/Swag Room, IT/Server Room, Water Softener & Electrical Room, Facilities Closet, Gym, Bike Storage, Facilities Storage, Wellness Room, Mother's Room & First Aid Room, Print/Copy Room, Employee Entrance & Exit, Cabin, 1049

### Map Interaction in App
- **Pannable and zoomable** (touch-friendly for phones)
- **Checkpoint pins overlaid** at the x,y coordinates above
- **Pin states:**
  - ✅ Green = completed checkpoint
  - 🟡 Gold (pulsing animation) = current target
  - ⚪ Grey/dim = undiscovered (future checkpoints)
- **Tapping a pin** shows the room name and status ("Discovered!" / "Your current target..." / "Not yet discovered")
- **Legend** shown below the map
- Map is collapsible (toggle show/hide) to save screen space

---

## 6. MASCOT — THE JUNGLE FAIRY

### Character Description
- Small chibi-style fairy with butterfly/moth wings
- Glowing green swirl body (bioluminescent look)
- Dark black hooded cloak with circuit-board texture detail
- Big warm brown eyes, friendly smile
- Wings: ornate with black and cream coloring, swirl patterns
- Color palette: greens (body glow), black (cloak), cream/white (wing accents)

### Asset
- **File:** `1776460357723_image.png` (provided)
- **Type:** Character sheet with front view, side view, back view, and 8 animation poses
- **Usage:** Extract individual poses/views from the sprite sheet for use in different app states

### Where the Fairy Appears
| App State | Fairy Pose/Usage | Dialogue Tone |
|-----------|-----------------|---------------|
| Registration | Welcoming, floating front-view | Warm, inviting |
| Riddle display | Thinking/mysterious pose | Cryptic, guiding |
| Correct scan + challenge appears | Excited, pointing | Encouraging |
| Challenge solved, checkpoint cleared | Happy, celebrating | Triumphant |
| Wrong room scanned | Worried, looking around | Gentle warning |
| Hint requested | Whispering pose | Conspiratorial, helpful |
| Victory (first place) | Holding the orb, crown | Grand, celebratory |
| Victory (other completers) | Waving, fairy dust | Warm, congratulatory |
| Leaderboard | Small icon next to #1 | — |

### Fairy's Voice (Writing Style for All In-App Text)
- Speaks in second person: *"You've found the grove, explorer!"*
- Mystical but not overly formal: *"The spirits sense your presence... but this isn't the right place."*
- Encouraging on failure: *"The jungle is tricky, but I believe in you. Read the riddle once more."*
- Celebratory on success: *"Brilliant! The path forward reveals itself!"*
- Uses jungle/nature metaphors throughout

---

## 7. QR CODE GENERATION

### What to Generate
10 QR codes, one per checkpoint room. Each encodes:

```
JUNGLE_HUNT_CLOVER
JUNGLE_HUNT_ASH
JUNGLE_HUNT_MAPLE
JUNGLE_HUNT_ORCHID
JUNGLE_HUNT_HICKORY
JUNGLE_HUNT_GLASGOW
JUNGLE_HUNT_IRIS
JUNGLE_HUNT_VIOLET
JUNGLE_HUNT_CHERRY
JUNGLE_HUNT_LIBRARY
```

### Printed Card Design
Each QR code should be printed on a card (~4x4 inches) with:
- Jungle-themed green/dark border
- The fairy mascot in a corner (small)
- The QR code centered
- Below the QR: the code text in small monospace font (for manual entry fallback)
- **DO NOT** print the room name on the card — that would give it away if someone peeks into the wrong room

### Where to Hide QR Codes (Organizer Reference)
| Room | Suggested Hiding Spot |
|------|----------------------|
| Clover | Under the conference table |
| Ash | Behind the room's TV/monitor |
| Maple | Under one of the chairs at the round table |
| Orchid | Behind the door |
| Hickory | Under the table or behind whiteboard |
| Glasgow | Inside a drawer or under a seat cushion |
| Iris | Under a shelf or behind a plant pot |
| Violet | Behind the door or under the desk |
| Cherry | Under a chair seat or behind the TV |
| Library | Inside a book (between specific pages) |

---

## 8. UI/UX DESIGN SPECIFICATIONS

### Design Direction
- **Theme:** Dark jungle — deep greens, blacks, with bioluminescent accents (matching the fairy's glow)
- **Primary palette:** Deep forest green (`#0A2A1B`), bright green glow (`#4ADE80`), gold accents (`#FBBF24`), off-white text
- **Typography:** Monospace/terminal font (Courier New or similar) for the jungle-tech-fairy aesthetic
- **Mood:** Mysterious but playful. Not scary — fun and adventurous.

### Mobile-First Screens

**Screen 1: Registration**
- Fairy mascot large and centered, floating
- Title: "LOST IN THE OFFICE JUNGLE"
- Subtitle: "A Treasure Hunt Adventure"
- Brief narrative intro from the fairy
- Name input field
- "ENTER THE JUNGLE" button
- Small "View Leaderboard" link at bottom

**Screen 2: Game (Main Loop)**
- Header: player name, hunt title, leaderboard & reset buttons
- Progress bar: X / 10 checkpoints
- Scan result toast (success green / failure red, with fairy message)
- Current riddle card:
  - Checkpoint number badge
  - Fairy flavor text (italic, subtle)
  - The riddle text (prominent)
  - "HINT" button (toggles hint text, styled as gold/warning)
  - "SCAN QR CODE" button (large, primary green CTA)
- Collapsible map section
- List of completed checkpoints as small green pills/tags

**Screen 3: QR Scanner**
- Full-screen camera overlay
- Green-bordered viewfinder
- "Point at QR code..." helper text
- Manual code entry input + GO button at bottom
- Close (X) button top-right

**Screen 4: Challenge (External)**
- This is NOT in the main app. Each challenge is a separate webpage that the QR code links to.
- After solving, the challenge page displays the passphrase.
- Player manually types the passphrase back into the main app.
- **Alternative approach:** The QR could deep-link back to the app with a challenge parameter, and the challenge renders inside the app. Organizer can decide.

**Screen 5: Victory**
- Large fairy mascot (triumphant pose for #1, waving for others)
- "JUNGLE CHAMPION!" (first place) or "JUNGLE CONQUERED!" (others)
- First place: special prize callout, excluded from draw
- Others: lucky draw entry confirmation
- Stats: name, total time, rank
- Leaderboard button

**Screen 6: Leaderboard**
- Back button
- Title: "JUNGLE LEADERBOARD"
- Count of completers
- Ranked list with:
  - Rank number (gold/silver/bronze for top 3)
  - Player name
  - "Special Prize Winner" for #1, "Lucky Draw Entry" for others
  - Completion time
- Real-time updates via Supabase subscription

### Animations
- Checkpoint pins on map: pulse animation for current target
- Correct scan: confetti or sparkle effect
- Wrong scan: shake animation on the error toast
- Victory: bouncing trophy/crown emoji
- Progress bar: smooth width transition on checkpoint clear

---

## 9. CHALLENGE HOSTING

Each challenge (except the mega finale) needs to be a web page. Options:

### Option A: Separate Static Pages on Netlify (Recommended)
Create a `/challenges/` directory with individual HTML pages:
```
/challenges/clover.html    → Emoji decode challenge
/challenges/ash.html       → GeoGuessr office photo
/challenges/maple.html     → Bracket City embed/link
/challenges/orchid.html    → Rebus puzzle
/challenges/hickory.html   → Google research prompt
/challenges/glasgow.html   → Cipher decoder
/challenges/iris.html      → Sequence completion
/challenges/violet.html    → CARTA word challenge
/challenges/cherry.html    → Math/age puzzle
/challenges/library.html   → Mega finale instructions
```

Each QR code links to: `https://[your-netlify-url].netlify.app/challenges/[room].html`

Each challenge page:
- Styled in the same jungle theme
- Shows the fairy mascot
- Presents the challenge
- On completion, displays: *"Your passphrase is: [WORD]"*
- Player memorizes/notes the passphrase and types it into the main app

### Option B: Challenges Built Into Main App
QR scan triggers an in-app challenge screen instead of an external URL. Cleaner UX but more complex to build. The QR code would encode something like `JUNGLE_HUNT_MAPLE_CHALLENGE` and the app renders the appropriate challenge component.

**Recommendation:** Option A is simpler and lets you iterate on challenges independently. The slight friction of switching between a challenge page and the app actually adds to the physical treasure hunt feel.

---

## 10. PASSPHRASE VALIDATION

In the main app, after scanning the correct QR and completing the challenge, the player types a passphrase. Validation rules:

- **Case-insensitive** comparison (player types "luck" or "LUCK" or "Luck" — all valid)
- **Trim whitespace** from input
- **Exact match required** against the stored passphrase for that checkpoint
- On correct passphrase: checkpoint cleared, celebration animation, next riddle
- On wrong passphrase: *"The fairy shakes her head... that's not quite right. Try again, explorer."* (let them retry unlimited times — they solved the challenge, they just might have a typo)

### Passphrase Table (for app configuration)
```javascript
const CHECKPOINTS = [
  { index: 0, roomId: "CLOVER",   passphrase: "LUCK" },
  { index: 1, roomId: "ASH",      passphrase: "[ORGANIZER_SET]" },
  { index: 2, roomId: "MAPLE",    passphrase: "[ORGANIZER_SET]" },
  { index: 3, roomId: "ORCHID",   passphrase: "[ORGANIZER_SET]" },
  { index: 4, roomId: "HICKORY",  passphrase: "[ORGANIZER_SET]" },
  { index: 5, roomId: "GLASGOW",  passphrase: "THEJUNGLEISALIVE" },
  { index: 6, roomId: "IRIS",     passphrase: "WALNUT" },
  { index: 7, roomId: "VIOLET",   passphrase: "[ORGANIZER_SET_NUMBER]" },
  { index: 8, roomId: "CHERRY",   passphrase: "36" },
  { index: 9, roomId: "LIBRARY",  passphrase: "[ORGANIZER_SET]" },
];
```

**IMPORTANT:** Passphrases marked `[ORGANIZER_SET]` must be decided by the organizer before the event and updated in the codebase/config. These depend on the specific challenge content chosen (which photo for GeoGuessr, which book for the research puzzle, etc.).

---

## 11. LOGISTICS & EVENT DAY CHECKLIST

### Before the Event
- [ ] Finalize all 10 passphrases (fill in the `[ORGANIZER_SET]` values)
- [ ] Build and deploy app to Netlify
- [ ] Build and deploy challenge pages
- [ ] Set up Supabase project and run the schema SQL
- [ ] Connect app to Supabase (env vars)
- [ ] Generate and print 10 QR code cards
- [ ] Take the GeoGuessr office photo for checkpoint 2 (Ash)
- [ ] Set up the Bracket City tournament for checkpoint 3 (Maple)
- [ ] Design the rebus puzzle for checkpoint 4 (Orchid)
- [ ] Choose the book/author for checkpoint 5 (Hickory)
- [ ] Finalize the CARTA word count for checkpoint 8 (Violet)
- [ ] Design the mega finale challenge for checkpoint 10 (Library)
- [ ] Get a physical safe/lockbox and set the combination
- [ ] Print winner chit and place inside safe
- [ ] Place safe at organizer's desk
- [ ] Test the full flow end-to-end on a phone

### Event Day Morning
- [ ] Hide QR codes in all 10 rooms (see hiding spots table)
- [ ] Verify Supabase is running and tables are empty
- [ ] Share the app URL in Slack / email to all participants
- [ ] Brief everyone: "Open this URL, register, and start when you're ready!"
- [ ] Stagger start times if needed (tell people to start in waves every 2 min)
- [ ] Organizer sits at desk ready for mega finale challengers

### After the Event
- [ ] Check leaderboard for first place winner → special prize
- [ ] Conduct lucky draw from all other completers
- [ ] Celebrate!

---

## 12. ASSETS PROVIDED

| Asset | File | Description |
|-------|------|-------------|
| Office Map | `/Users/rhythm.chawla/carta_repos/treasure/assets/office.png` | Envoy floor plan with all room names visible |
| Mascot | `/Users/rhythm.chawla/carta_repos/treasure/assets/host.png` | Fairy character sheet: front/side/back views + 8 animation poses |

---

## 13. OPEN ITEMS (Organizer Must Decide)

1. **Fairy's name** — Does the mascot have a name? Used in all dialogue.
2. **GeoGuessr photo** (Checkpoint 2) — Take the photo and set the passphrase.
3. **Bracket City config** (Checkpoint 3) — Set up the tournament and determine the passphrase.
4. **Rebus puzzle design** (Checkpoint 4) — Design the images and set the passphrase.
5. **Book/author choice** (Checkpoint 5) — Pick the book and confirm the author's birthplace as passphrase.
6. **CARTA word count** (Checkpoint 8) — Finalize the official word list and count.
7. **Mega finale challenge** (Checkpoint 10) — Design whatever you want! It's your moment.
8. **Safe combination** — Set it and link it to the mega challenge answer.
9. **Prizes** — What are the special prize and lucky draw prizes?
10. **Event date and time** — When does the hunt start?
