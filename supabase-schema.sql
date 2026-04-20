-- ================================================================
-- LOST IN THE OFFICE JUNGLE — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ================================================================

-- ----------------------------------------------------------------
-- PLAYERS
-- ----------------------------------------------------------------
CREATE TABLE players (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT        NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 40),
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  start_time     TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at   TIMESTAMPTZ,
  is_first_place BOOLEAN     NOT NULL DEFAULT false,
  current_step   SMALLINT    NOT NULL DEFAULT 0
                             CHECK (current_step BETWEEN 0 AND 10)
);

-- ----------------------------------------------------------------
-- PROGRESS (immutable audit trail — no updates/deletes)
-- ----------------------------------------------------------------
CREATE TABLE progress (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id        UUID        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  checkpoint_index SMALLINT    NOT NULL CHECK (checkpoint_index BETWEEN 0 AND 9),
  room_id          TEXT        NOT NULL CHECK (room_id IN (
                                 'CLOVER','ASH','MAPLE','ORCHID','HICKORY',
                                 'GLASGOW','IRIS','VIOLET','CHERRY','LIBRARY'
                               )),
  completed_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (player_id, checkpoint_index)
);

-- ----------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------
CREATE INDEX idx_players_completed ON players (completed_at)
  WHERE completed_at IS NOT NULL;

CREATE INDEX idx_progress_player ON progress (player_id);

-- ----------------------------------------------------------------
-- REAL-TIME
-- ----------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE progress;

-- ----------------------------------------------------------------
-- LEADERBOARD VIEW
-- ----------------------------------------------------------------
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

-- ----------------------------------------------------------------
-- HELPER: read calling player's UUID from request header
-- The app sends x-player-id on every request via a fetch interceptor.
-- SECURITY DEFINER + empty search_path prevents privilege escalation.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_player_id_from_header()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT NULLIF(
    current_setting('request.headers', true)::json->>'x-player-id',
    ''
  )::UUID
$$;

-- ----------------------------------------------------------------
-- TRIGGER: prevent current_step from going backwards
-- Stops a malicious client from resetting their step count.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_step_regression()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.current_step < OLD.current_step THEN
    RAISE EXCEPTION 'current_step cannot decrease (% → %)', OLD.current_step, NEW.current_step;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_step_regression
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION prevent_step_regression();

-- ----------------------------------------------------------------
-- TRIGGER: completed_at and is_first_place are write-once
-- Once a player finishes, those fields cannot be changed.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_completion_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.completed_at IS NOT NULL AND NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN
    RAISE EXCEPTION 'completed_at is immutable once set';
  END IF;
  IF OLD.is_first_place = true AND NEW.is_first_place = false THEN
    RAISE EXCEPTION 'is_first_place cannot be unset';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_completion_mutation
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION prevent_completion_mutation();

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

-- ----------------------------------------------------------------
-- PLAYERS
-- ----------------------------------------------------------------
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Anyone with the anon key can register
CREATE POLICY "players: anon insert"
  ON players FOR INSERT TO anon
  WITH CHECK (char_length(trim(name)) > 0);

-- Anyone can read the full players list (leaderboard + rejoin flow)
CREATE POLICY "players: public read"
  ON players FOR SELECT TO anon
  USING (true);

-- A player can only update their own row.
-- The app proves identity by sending x-player-id in every request header.
CREATE POLICY "players: update own row only"
  ON players FOR UPDATE TO anon
  USING  (id = get_player_id_from_header())
  WITH CHECK (id = get_player_id_from_header());

-- No DELETE policy → nobody can delete player rows.

-- ----------------------------------------------------------------
-- PROGRESS
-- ----------------------------------------------------------------
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Anyone can read progress rows (used for stats/leaderboard)
CREATE POLICY "progress: public read"
  ON progress FOR SELECT TO anon
  USING (true);

-- A player can only insert progress for themselves
CREATE POLICY "progress: insert own"
  ON progress FOR INSERT TO anon
  WITH CHECK (player_id = get_player_id_from_header());

-- No UPDATE or DELETE policy → progress rows are immutable.
