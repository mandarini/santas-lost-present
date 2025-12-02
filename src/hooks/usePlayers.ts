import { useState, useEffect } from 'react';
import { supabase, Player } from '../lib/supabase';

export function usePlayers() {
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());

  useEffect(() => {
    fetchPlayers();

    const channel = supabase
      .channel('players')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const player = payload.new as Player;
            setPlayers((prev) => {
              const next = new Map(prev);
              next.set(player.id, player);
              return next;
            });
          } else if (payload.eventType === 'UPDATE') {
            const player = payload.new as Player;
            setPlayers((prev) => {
              const next = new Map(prev);
              next.set(player.id, player);
              return next;
            });
          } else if (payload.eventType === 'DELETE') {
            const player = payload.old as Player;
            setPlayers((prev) => {
              const next = new Map(prev);
              next.delete(player.id);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase.from('players').select('*');

      if (error) throw error;

      const playerMap = new Map<string, Player>();
      data?.forEach((player) => {
        playerMap.set(player.id, player);
      });
      setPlayers(playerMap);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  return players;
}
