-- Enable the required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job to run every hour
SELECT cron.schedule(
  'cleanup-expired-bookings',
  '0 * * * *',  -- Run at minute 0 of every hour
  $$
  SELECT net.http_post(
    url:='https://uskbzgezgqkgcrmtzkbx.supabase.co/functions/v1/cleanup-expired-bookings',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVza2J6Z2V6Z3FrZ2NybXR6a2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0OTM4ODYsImV4cCI6MjA1MzA2OTg4Nn0.fTyMF4tRR7MBcxM6U80Ej5nDnjMZ19BPIBVkdiQgprg"}'::jsonb
  ) as request_id;
  $$
);