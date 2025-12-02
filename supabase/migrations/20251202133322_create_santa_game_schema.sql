/*
  # Santa's Lost Present Game Schema

  ## Overview
  Creates the complete database schema for a real-time multiplayer Christmas treasure hunt game.

  ## 1. New Tables

  ### `rounds` (Single active round)
  - `id` (text, PK) - Fixed to 'main-round' for single-room architecture
  - `status` (text) - Game state: 'idle', 'running', 'finished'
  - `mode` (text) - Game mode: 'normal', 'elf' (moving target)
  - `round_no` (integer) - Current round number
  - `started_at` (timestamptz) - Round start time
  - `ended_at` (timestamptz) - Round end time
  - `target_lat` (double precision) - Hidden present latitude
  - `target_lng` (double precision) - Hidden present longitude
  - `winner_player_id` (uuid) - Winner reference
  - `winner_distance_m` (double precision) - Winning distance
  - `created_at`, `updated_at` (timestamptz) - Timestamps

  ### `players`
  - `id` (uuid, PK) - Player identifier
  - `device_id` (text, unique) - Device fingerprint for auth
  - `nickname` (text) - Auto-generated Christmas nickname
  - `color` (text) - Display color derived from nickname
  - `joined_at` (timestamptz) - First join time
  - `last_seen_at` (timestamptz) - Activity tracking

  ### `guesses`
  - `id` (uuid, PK) - Guess identifier
  - `round_no` (integer) - Round this guess belongs to
  - `player_id` (uuid) - Player reference
  - `lat`, `lng` (double precision) - Guess coordinates
  - `created_at` (timestamptz) - Submission time
  - Unique constraint on (round_no, player_id) for upsert pattern

  ### `nickname_words`
  - `id` (uuid, PK) - Word identifier
  - `word` (text, unique) - Nickname component
  - `position` (integer) - Position in nickname (1=adjective, 2=noun, 3=action)
  - `created_at` (timestamptz) - Timestamp

  ### `rate_limits`
  - `id` (uuid, PK) - Rate limit record ID
  - `ip_address` (text) - Client IP
  - `action` (text) - Action being rate limited
  - `request_count` (integer) - Requests in current window
  - `window_start` (timestamptz) - Window start time
  - Unique constraint on (ip_address, action)

  ### `admin_allowlist`
  - `email` (text, PK) - Allowed admin email

  ## 2. Security
  - Enable RLS on all tables
  - Public read access for game tables (rounds, players, guesses, nickname_words)
  - No public access to rate_limits and admin_allowlist (service role only)

  ## 3. Functions
  - `check_rate_limit()` - Rate limiting for Edge Functions
  - `is_admin()` - Admin authorization check
  - `random_london_location()` - Generate random target within M25 bounds

  ## 4. Initial Data
  - Insert single round record
  - Seed 45 Christmas nickname words (15 per position)
*/

-- Create rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id text PRIMARY KEY DEFAULT 'main-round',
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'finished')),
  mode text NOT NULL DEFAULT 'normal' CHECK (mode IN ('normal', 'elf')),
  round_no integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  ended_at timestamptz,
  target_lat double precision,
  target_lng double precision,
  winner_player_id uuid,
  winner_distance_m double precision,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL UNIQUE,
  nickname text NOT NULL,
  color text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now()
);

-- Create guesses table
CREATE TABLE IF NOT EXISTS guesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_no integer NOT NULL,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(round_no, player_id)
);

-- Create nickname_words table
CREATE TABLE IF NOT EXISTS nickname_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text UNIQUE NOT NULL,
  position integer NOT NULL CHECK (position IN (1, 2, 3)),
  created_at timestamptz DEFAULT now()
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  action text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ip_address, action)
);

-- Create admin_allowlist table
CREATE TABLE IF NOT EXISTS admin_allowlist (
  email text PRIMARY KEY
);

-- Enable RLS on all tables
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE guesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nickname_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_allowlist ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "public read rounds" ON rounds FOR SELECT USING (true);
CREATE POLICY "public read players" ON players FOR SELECT USING (true);
CREATE POLICY "public read guesses" ON guesses FOR SELECT USING (true);
CREATE POLICY "public read nickname_words" ON nickname_words FOR SELECT USING (true);

-- Rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip_address text,
  p_action text,
  p_max_requests integer DEFAULT 10,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
  v_window_start timestamptz;
BEGIN
  v_window_start := now() - (p_window_seconds * INTERVAL '1 second');

  SELECT * INTO v_record
  FROM rate_limits
  WHERE ip_address = p_ip_address AND action = p_action;

  IF v_record IS NULL THEN
    INSERT INTO rate_limits (ip_address, action, request_count, window_start)
    VALUES (p_ip_address, p_action, 1, now());
    RETURN true;
  END IF;

  IF v_record.window_start < v_window_start THEN
    UPDATE rate_limits
    SET request_count = 1, window_start = now()
    WHERE ip_address = p_ip_address AND action = p_action;
    RETURN true;
  END IF;

  IF v_record.request_count < p_max_requests THEN
    UPDATE rate_limits
    SET request_count = request_count + 1
    WHERE ip_address = p_ip_address AND action = p_action;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Admin check function
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_allowlist WHERE email = user_email
  );
$$;

-- Random London location generator (M25 bounds)
CREATE OR REPLACE FUNCTION random_london_location()
RETURNS TABLE(lat double precision, lng double precision)
LANGUAGE sql
AS $$
  SELECT
    51.3 + (random() * 0.4) as lat,
    -0.5 + (random() * 0.8) as lng
$$;

-- Initialize the single round record
INSERT INTO rounds (id, status, mode, round_no)
VALUES ('main-round', 'idle', 'normal', 0)
ON CONFLICT (id) DO NOTHING;

-- Seed nickname words
-- Position 1: Adjectives
INSERT INTO nickname_words (word, position) VALUES
  ('Snowy', 1), ('Jolly', 1), ('Frosty', 1), ('Merry', 1), ('Cozy', 1),
  ('Sparkly', 1), ('Cheerful', 1), ('Festive', 1), ('Jingly', 1), ('Twinkly', 1),
  ('Holly', 1), ('Icy', 1), ('Wintry', 1), ('Gifted', 1), ('Magical', 1)
ON CONFLICT (word) DO NOTHING;

-- Position 2: Christmas Nouns
INSERT INTO nickname_words (word, position) VALUES
  ('Elf', 2), ('Reindeer', 2), ('Snowman', 2), ('Santa', 2), ('Angel', 2),
  ('Gingerbread', 2), ('Nutcracker', 2), ('Candy', 2), ('Sleigh', 2), ('Star', 2),
  ('Cookie', 2), ('Mitten', 2), ('Penguin', 2), ('Yeti', 2), ('Polar', 2)
ON CONFLICT (word) DO NOTHING;

-- Position 3: Actions
INSERT INTO nickname_words (word, position) VALUES
  ('Hunter', 3), ('Finder', 3), ('Seeker', 3), ('Catcher', 3), ('Chaser', 3),
  ('Scout', 3), ('Tracker', 3), ('Spotter', 3), ('Detective', 3), ('Explorer', 3),
  ('Searcher', 3), ('Discoverer', 3), ('Locator', 3), ('Pathfinder', 3), ('Ranger', 3)
ON CONFLICT (word) DO NOTHING;