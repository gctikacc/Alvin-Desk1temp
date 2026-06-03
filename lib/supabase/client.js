import { createClient } from "@supabase/supabase-js";

// Directly hardcode Supabase project URL & anon key
const url = "https://rwjwzeqiqkfsqjdxqkcy.supabase.co";
const anonKey = "sb_publishable_S7a8xyeuIkmIfxgLZaV6qw_sspuGu3I";

export const isSupabaseConfigured = () => Boolean(url && anonKey);

export const supabase = isSupabaseConfigured()
  ? createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";
