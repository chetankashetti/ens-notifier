import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

// Client-side Supabase client
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
