import { useState, useEffect } from 'react';
import { supabase, Guess } from '../lib/supabase';

export function useGuesses(roundNo: number | null) {
  const [guesses, setGuesses] = useState<Map<string, Guess>>(new Map());

  useEffect(() => {
    if (roundNo === null) return;

    fetchGuesses();

    const channel = supabase
      .channel('guesses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guesses',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const guess = payload.new as Guess;
            if (guess.round_no === roundNo) {
              setGuesses((prev) => {
                const next = new Map(prev);
                next.set(guess.player_id, guess);
                return next;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const guess = payload.old as Guess;
            setGuesses((prev) => {
              const next = new Map(prev);
              next.delete(guess.player_id);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roundNo]);

  const fetchGuesses = async () => {
    if (roundNo === null) return;

    try {
      const { data, error } = await supabase
        .from('guesses')
        .select('*')
        .eq('round_no', roundNo);

      if (error) throw error;

      const guessMap = new Map<string, Guess>();
      data?.forEach((guess) => {
        guessMap.set(guess.player_id, guess);
      });
      setGuesses(guessMap);
    } catch (err) {
      console.error('Error fetching guesses:', err);
    }
  };

  return guesses;
}
