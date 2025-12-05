import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Round = {
  id: string;
  status: 'idle' | 'running' | 'finished';
  mode: 'normal' | 'elf';
  round_no: number;
  started_at: string | null;
  ended_at: string | null;
  target_lat: number | null;
  target_lng: number | null;
  winner_player_id: string | null;
  winner_distance_m: number | null;
  show_distance: boolean;
  created_at: string;
  updated_at: string;
};

export type Player = {
  id: string;
  device_id: string;
  nickname: string;
  color: string;
  joined_at: string;
  last_seen_at: string;
};

export type Guess = {
  id: string;
  round_no: number;
  player_id: string;
  lat: number;
  lng: number;
  created_at: string;
};
