/*
  # Configure pg_cron Jobs

  ## Overview
  Sets up scheduled jobs for the Santa game:
  1. Move target every 20 seconds in Elf mode
  2. Cleanup old rate limit records hourly

  ## Jobs

  ### move-elf-target
  - **Schedule**: Every 20 seconds
  - **Purpose**: Randomly relocate target when round is running in Elf mode
  - **Bounds**: Greater London (M25) - lat: 51.3-51.7, lng: -0.5-0.3

  ### cleanup-rate-limits
  - **Schedule**: Every hour
  - **Purpose**: Remove rate limit records older than 1 hour
*/

-- Move target every 20 seconds for Elf mode
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'move-elf-target'
  ) THEN
    PERFORM cron.schedule(
      'move-elf-target',
      '*/20 * * * * *',
      $cron$
        UPDATE rounds
        SET target_lat = 51.3 + (random() * 0.4),
            target_lng = -0.5 + (random() * 0.8),
            updated_at = now()
        WHERE id = 'main-round'
          AND status = 'running'
          AND mode = 'elf';
      $cron$
    );
  END IF;
END $$;

-- Cleanup old rate limits every hour
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-rate-limits'
  ) THEN
    PERFORM cron.schedule(
      'cleanup-rate-limits',
      '0 * * * *',
      $cron$DELETE FROM rate_limits WHERE window_start < now() - INTERVAL '1 hour';$cron$
    );
  END IF;
END $$;