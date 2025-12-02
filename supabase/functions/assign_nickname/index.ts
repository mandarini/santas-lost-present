import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateColor(nickname: string): string {
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
  ];
  const hash = hashString(nickname);
  return colors[hash % colors.length];
}

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

    const { deviceId } = await req.json();

    if (!deviceId) {
      return new Response(
        JSON.stringify({ error: 'deviceId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (existingPlayer) {
      await supabase
        .from('players')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', existingPlayer.id);

      return new Response(
        JSON.stringify(existingPlayer),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: canProceed } = await supabase
      .rpc('check_rate_limit', {
        p_ip_address: clientIp,
        p_action: 'assign_nickname',
        p_max_requests: 10,
        p_window_seconds: 60
      });

    if (!canProceed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: words, error: wordsError } = await supabase
      .from('nickname_words')
      .select('word, position');

    if (wordsError || !words || words.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch nickname words' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const position1Words = words.filter(w => w.position === 1);
    const position2Words = words.filter(w => w.position === 2);
    const position3Words = words.filter(w => w.position === 3);

    let nickname = '';
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const word1 = position1Words[Math.floor(Math.random() * position1Words.length)].word;
      const word2 = position2Words[Math.floor(Math.random() * position2Words.length)].word;
      const word3 = position3Words[Math.floor(Math.random() * position3Words.length)].word;
      nickname = `${word1}${word2}${word3}`;

      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('nickname', nickname)
        .maybeSingle();

      if (!existing) {
        break;
      }

      attempts++;
    }

    if (attempts === maxAttempts) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate unique nickname' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const color = generateColor(nickname);

    const { data: newPlayer, error: insertError } = await supabase
      .from('players')
      .insert({
        device_id: deviceId,
        nickname,
        color,
        joined_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError || !newPlayer) {
      return new Response(
        JSON.stringify({ error: 'Failed to create player' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify(newPlayer),
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