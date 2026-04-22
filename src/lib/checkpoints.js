export const CHECKPOINTS = [
  {
    index: 0,
    roomId: 'CLOVER',
    passphrase: 'LUCK',
    riddle:
      "Lucky are those who seek the middle sister. Three rooms stand in a row on the jungle floor — not the first, not the last, but the one fortune favors.",
    hint: "Look at the three rooms in a row in the center of the map.",
    challengeUrl: '/challenges/e3a7f2b1.html',
  },
  {
    index: 1,
    roomId: 'ASH',
    passphrase: 'LIBRARY',
    riddle:
      "From the ashes of the old jungle, a mighty chamber arose. Three great halls line the eastern ridge — this one sits closest to the warriors' training pit, towering above its siblings.",
    hint: "Three large rooms stacked on the east side. This one is at the top, nearest the gym.",
    challengeUrl: '/challenges/d9c4e108.html',
  },
  {
    index: 2,
    roomId: 'MAPLE',
    passphrase: 'CROMWELL DISSOLVES THE RUMP PARLIAMENT',
    riddle:
      "The grandest canopy in the jungle — a round gathering place where the elders once convened. Its leaf adorns a distant nation's flag. Find the great circle table.",
    hint: "A large conference room with a round table in the center-north area.",
    challengeUrl: '/challenges/5b2f8a3c.html',
  },
  {
    index: 3,
    roomId: 'ORCHID',
    passphrase: 'CARTA',
    riddle:
      "Exotic and rare, the jungle's most prized bloom. Five flowers cling to the eastern wall in a vertical vine — this one hangs lowest, nearest where the healers tend to the wounded.",
    hint: "Five small rooms run vertically along the far east wall. This is the bottom one, near First Aid.",
    challengeUrl: '/challenges/7e1d4c9f.html',
  },
  {
    index: 4,
    roomId: 'HICKORY',
    passphrase: 'TONY',
    riddle:
      "Tough as old bark and smoky in legend, this tree's wood has fueled a thousand jungle campfires. Three great halls line the eastern ridge — you've conquered the peak, now descend to the valley floor.",
    hint: "You've already been to Ash (top). Hickory is the bottom of the three large east-side rooms.",
    challengeUrl: '/challenges/a4b6e20d.html',
  },
  {
    index: 5,
    roomId: 'GLASGOW',
    passphrase: 'THEJUNGLEISALIVE',
    riddle:
      "Not a flower, not a tree — a faraway human settlement at the jungle's forgotten edge. Travel as far northwest as the jungle allows. You'll know you've arrived when you smell the dishwashing river and hear the hum of the kitchen fires.",
    hint: "The very first room in the top-left corner of the map. Kitchen and Dishwashing Room are its neighbors.",
    challengeUrl: '/challenges/2c9f1b7e.html',
  },
  {
    index: 6,
    roomId: 'IRIS',
    passphrase: 'WALNUT',
    riddle:
      "In the southern gardens, four flowers bloom in a row. The rainbow goddess planted hers second from the left, right beside the ancient archive where all jungle knowledge is kept.",
    hint: "Four rooms in a row on the south side. Iris is second from the left, right next to the Library.",
    challengeUrl: '/challenges/f8d3a5c2.html',
  },
  {
    index: 7,
    roomId: 'VIOLET',
    passphrase: ['TEN', '10'],
    riddle:
      "Shrinking and shy, a tiny purple bloom hides at the very top of the eastern vine. Five flowers grow vertically along the far wall — you visited the lowest; now seek the highest. The entrance to the outside world is just steps away.",
    hint: "Five small rooms on the far east wall. Violet is the topmost one, near the Employee Entrance.",
    challengeUrl: '/challenges/1a7e4b9d.html',
  },
  {
    index: 8,
    roomId: 'CHERRY',
    passphrase: '36',
    riddle:
      "Sweet blossoms fall like pink rain in the heart of the eastern ridge. You've stood at the summit and walked the valley — now rest in the grove between them. The middle sibling awaits.",
    hint: "You've been to Ash (top) and Hickory (bottom). Cherry is the middle of the three large east-side rooms.",
    challengeUrl: '/challenges/6f2c8d3a.html',
  },
  {
    index: 9,
    roomId: 'LIBRARY',
    passphrase: 'FREEATLAST',
    riddle:
      "Your journey nears its end, brave explorer. All jungle knowledge flows to one sacred place — the ancient archive where wisdom sleeps. In the southern gardens, four rooms stand in a row. You've visited the second — now seek the first. Go to where books live... and find the fairy's final trial.",
    hint: "The Library. South side, leftmost of the four rooms. You're almost there.",
    challengeUrl: '/challenges/b4e1f7c9.html',
  },
]

export function getCheckpoint(index) {
  return CHECKPOINTS[index] ?? null
}

export function validatePassphrase(checkpoint, input) {
  const normalized = input.trim().toUpperCase()
  if (Array.isArray(checkpoint.passphrase)) {
    return checkpoint.passphrase.some((p) => p.toUpperCase() === normalized)
  }
  return checkpoint.passphrase.toUpperCase() === normalized
}

export function parseQrCode(raw) {
  if (!raw?.startsWith('JUNGLE_HUNT_')) return null
  return raw.replace('JUNGLE_HUNT_', '')
}
