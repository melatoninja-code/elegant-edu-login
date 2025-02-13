import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uskbzgezgqkgcrmtzkbx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVza2J6Z2V6Z3FrZ2NybXR6a2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0OTM4ODYsImV4cCI6MjA1MzA2OTg4Nn0.fTyMF4tRR7MBcxM6U80Ej5nDnjMZ19BPIBVkdiQgprg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
});