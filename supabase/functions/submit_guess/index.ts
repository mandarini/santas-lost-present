import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { deviceId, lat, lng } = await req.json();

    if (!deviceId || lat === undefined || lng === undefined) {
      return new Response(
        JSON.stringify({ error: 'deviceId, lat, and lng are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (lat < 51.3 || lat > 51.7 || lng < -0.5 || lng > 0.3) {
      return new Response(
        JSON.stringify({ error: 'Coordinates must be within Greater London (M25 bounds)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: player } = await supabase
      .from('players')
      .select('id')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (!player) {
      return new Response(
        JSON.stringify({ error: 'Player not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: round } = await supabase
      .from('rounds')
      .select('status, round_no, target_lat, target_lng')
      .eq('id', 'main-round')
      .single();

    if (!round || round.status !== 'running') {
      return new Response(
        JSON.stringify({ error: 'No active round' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    const { data: canProceed } = await supabase
      .rpc('check_rate_limit', {
        p_ip_address: clientIp,
        p_action: 'submit_guess',
        p_max_requests: 2,
        p_window_seconds: 1
      });

    if (!canProceed) {
      return new Response(
        JSON.stringify({ error: 'Please wait before submitting another guess' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: guess, error: guessError } = await supabase
      .from('guesses')
      .upsert({
        round_no: round.round_no,
        player_id: player.id,
        lat,
        lng,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'round_no,player_id'
      })
      .select()
      .single();

    if (guessError || !guess) {
      return new Response(
        JSON.stringify({ error: 'Failed to save guess' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate distance from target using Haversine formula
    let distance_m: number | null = null;
    if (round.target_lat !== null && round.target_lng !== null) {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (lat * Math.PI) / 180;
      const φ2 = (round.target_lat * Math.PI) / 180;
      const Δφ = ((round.target_lat - lat) * Math.PI) / 180;
      const Δλ = ((round.target_lng - lng) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      distance_m = R * c;
    }

    return new Response(
      JSON.stringify({ ok: true, guess_id: guess.id, distance_m }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});