-- Run this in your Supabase project's SQL Editor before the event

CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  start_time TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_first_place BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 0
);

CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  checkpoint_index INTEGER NOT NULL,
  room_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, checkpoint_index)
);

ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE progress;

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
