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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || !user.email) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: isAdminResult } = await supabase
      .rpc('is_admin', { user_email: user.email });

    if (!isAdminResult) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await req.json();
    const { action } = body;

    let result;

    switch (action) {
      case 'start_round': {
        const { mode, target_lat, target_lng } = body;

        if (!mode || !target_lat || !target_lng) {
          return new Response(
            JSON.stringify({ error: 'mode, target_lat, and target_lng are required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { data: round } = await supabase
          .from('rounds')
          .select('round_no')
          .eq('id', 'main-round')
          .single();

        const newRoundNo = (round?.round_no || 0) + 1;

        const { error: updateError } = await supabase
          .from('rounds')
          .update({
            status: 'running',
            mode,
            round_no: newRoundNo,
            target_lat,
            target_lng,
            started_at: new Date().toISOString(),
            ended_at: null,
            winner_player_id: null,
            winner_distance_m: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'main-round');

        if (updateError) {
          throw updateError;
        }

        result = { ok: true, round_no: newRoundNo };
        break;
      }

      case 'stop_round': {
        const { error: updateError } = await supabase
          .from('rounds')
          .update({
            status: 'finished',
            ended_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', 'main-round');

        if (updateError) {
          throw updateError;
        }

        result = { ok: true };
        break;
      }

      case 'set_winner': {
        const { winner_player_id, winner_distance_m } = body;

        if (!winner_player_id || winner_distance_m === undefined) {
          return new Response(
            JSON.stringify({ error: 'winner_player_id and winner_distance_m are required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { error: updateError } = await supabase
          .from('rounds')
          .update({
            status: 'finished',
            winner_player_id,
            winner_distance_m,
            ended_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', 'main-round');

        if (updateError) {
          throw updateError;
        }

        result = { ok: true };
        break;
      }

      case 'reset_round': {
        const { data: round } = await supabase
          .from('rounds')
          .select('round_no')
          .eq('id', 'main-round')
          .single();

        if (round) {
          await supabase
            .from('guesses')
            .delete()
            .eq('round_no', round.round_no);
        }

        const { error: updateError } = await supabase
          .from('rounds')
          .update({
            status: 'idle',
            started_at: null,
            ended_at: null,
            target_lat: null,
            target_lng: null,
            winner_player_id: null,
            winner_distance_m: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'main-round');

        if (updateError) {
          throw updateError;
        }

        result = { ok: true };
        break;
      }

      case 'move_target': {
        const { target_lat, target_lng } = body;

        if (target_lat === undefined || target_lng === undefined) {
          return new Response(
            JSON.stringify({ error: 'target_lat and target_lng are required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { error: updateError } = await supabase
          .from('rounds')
          .update({
            target_lat,
            target_lng,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'main-round');

        if (updateError) {
          throw updateError;
        }

        result = { ok: true };
        break;
      }

      case 'toggle_show_distance': {
        const { data: round } = await supabase
          .from('rounds')
          .select('show_distance')
          .eq('id', 'main-round')
          .single();

        const { error: updateError } = await supabase
          .from('rounds')
          .update({
            show_distance: !round?.show_distance,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'main-round');

        if (updateError) {
          throw updateError;
        }

        result = { ok: true, show_distance: !round?.show_distance };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    return new Response(
      JSON.stringify(result),
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