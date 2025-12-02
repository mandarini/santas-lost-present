/*
  # Enable pg_cron Extension

  ## Overview
  Enables the pg_cron extension for scheduled jobs.
  This extension must be enabled before creating cron jobs.
*/

CREATE EXTENSION IF NOT EXISTS pg_cron;