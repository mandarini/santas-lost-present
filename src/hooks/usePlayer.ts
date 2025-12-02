import { useState, useEffect } from 'react';
import { supabase, Player } from '../lib/supabase';

const PLAYER_KEY = 'santa-game-player';

export function usePlayer(deviceId: string) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) {
      setLoading(false);
      return;
    }

    const cachedPlayer = localStorage.getItem(PLAYER_KEY);
    if (cachedPlayer) {
      try {
        setPlayer(JSON.parse(cachedPlayer));
      } catch (e) {
        console.error('Failed to parse cached player', e);
      }
    }

    assignNickname();
  }, [deviceId]);

  const assignNickname = async () => {
    if (!deviceId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('assign_nickname', {
        body: { deviceId },
      });

      if (error) throw error;

      if (data) {
        setPlayer(data);
        localStorage.setItem(PLAYER_KEY, JSON.stringify(data));
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to assign nickname');
      console.error('Error assigning nickname:', err);
    } finally {
      setLoading(false);
    }
  };

  return { player, loading, error };
}
