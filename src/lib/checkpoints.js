export const CHECKPOINTS = [
  {
    index: 0,
    roomId: 'CLOVER',
    passphrase: 'LUCK',
    riddle: "Lucky are those who seek the middle sister. Three rooms stand in a row on the jungle floor — not the first, not the last, but the one fortune favors.",
    hint: "Look at the three rooms in a row in the center of the map.",
    challengeUrl: '/challenges/clover.html',
  },
  {
    index: 1,
    roomId: 'ASH',
    passphrase: 'LIBRARY',
    riddle: "From the ashes of the old jungle, a mighty chamber arose. It watches over the training grounds where warriors test their strength. Seek the largest room near the northern fighting pit.",
    hint: "Find the large room on the east side, near the gym.",
    challengeUrl: '/challenges/ash.html',
  },
  {
    index: 2,
    roomId: 'MAPLE',
    passphrase: 'CROMWELL DISSOLVES THE RUMP PARLIAMENT',
    riddle: "The grandest canopy in the jungle — a round gathering place where the elders once convened. Its leaf adorns a distant nation's flag. Find the great circle table.",
    hint: "A large conference room with a round table in the center-north area.",
    challengeUrl: '/challenges/maple.html',
  },
  {
    index: 3,
    roomId: 'ORCHID',
    passphrase: 'CARTA',
    riddle: "Exotic and rare, the jungle's most prized bloom grows near where the healers rest. Seek the flower closest to the place of first aid.",
    hint: "Head to the far east side, near the First Aid / Mother's Room.",
    challengeUrl: '/challenges/orchid.html',
  },
  {
    index: 4,
    roomId: 'HICKORY',
    passphrase: 'TONY',
    riddle: "Tough as old bark and smoky in legend, this tree's wood has fueled a thousand jungle campfires. Seek the southern sibling of Cherry and Ash on the jungle's eastern ridge.",
    hint: "Three large rooms on the east side. You want the southernmost one.",
    challengeUrl: '/challenges/hickory.html',
  },
  {
    index: 5,
    roomId: 'GLASGOW',
    passphrase: 'THEJUNGLEISALIVE',
    riddle: "Not a flower, not a tree — a faraway human settlement at the jungle's forgotten edge. Travel to the farthest northwest outpost, where the dishwashing river flows nearby.",
    hint: "Far northwest corner. Dishwashing room is close by.",
    challengeUrl: '/challenges/glasgow.html',
  },
  {
    index: 6,
    roomId: 'IRIS',
    passphrase: 'WALNUT',
    riddle: "The rainbow goddess planted her flower in the southern gardens, beside the ancient hall of knowledge. Seek the colorful bloom near the Library.",
    hint: "South side of the map, near the Library room.",
    challengeUrl: '/challenges/iris.html',
  },
  {
    index: 7,
    roomId: 'VIOLET',
    passphrase: ['TEN', '10'],
    riddle: "Shrinking and shy, a tiny purple bloom hides in the jungle's far northeast corner, high above where explorers enter and exit.",
    hint: "Far northeast corner, near the Employee Entrance.",
    challengeUrl: '/challenges/violet.html',
  },
  {
    index: 8,
    roomId: 'CHERRY',
    passphrase: '36',
    riddle: "Sweet blossoms fall like pink rain in the middle of the eastern ridge. Between the Ash summit above and the Hickory valley below, the cherry grove blooms eternal.",
    hint: "Middle of the three large east-side rooms.",
    challengeUrl: '/challenges/cherry.html',
  },
  {
    index: 9,
    roomId: 'LIBRARY',
    passphrase: 'PLACEHOLDER_LIBRARY',
    riddle: "Your journey nears its end, brave explorer. All jungle knowledge flows to one sacred place — the ancient archive where wisdom sleeps. Go to where books live... and find the fairy's final trial.",
    hint: "The Library. South side. You're almost there.",
    challengeUrl: '/challenges/library.html',
  },
]

export function getCheckpoint(index) {
  return CHECKPOINTS[index] ?? null
}

export function validatePassphrase(checkpoint, input) {
  const normalized = input.trim().toUpperCase()
  if (Array.isArray(checkpoint.passphrase)) {
    return checkpoint.passphrase.some(p => p.toUpperCase() === normalized)
  }
  return checkpoint.passphrase.toUpperCase() === normalized
}

export function parseQrCode(raw) {
  if (!raw?.startsWith('JUNGLE_HUNT_')) return null
  return raw.replace('JUNGLE_HUNT_', '')
}
