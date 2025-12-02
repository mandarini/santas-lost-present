import { useState, useEffect } from 'react';
import { supabase, Round } from '../lib/supabase';

export function useRound() {
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRound();

    const channel = supabase
      .channel('round-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rounds',
          filter: 'id=eq.main-round',
        },
        (payload) => {
          setRound(payload.new as Round);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRound = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', 'main-round')
        .single();

      if (error) throw error;
      setRound(data);
    } catch (err) {
      console.error('Error fetching round:', err);
    } finally {
      setLoading(false);
    }
  };

  return { round, loading };
}
