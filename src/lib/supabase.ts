import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rvfuylalzxqlxdzcubzn.supabase.co";
const supabaseAnonKey = "sb_publishable_WROZD0B0r0UPlwTgF5wSPg_umpwx7cg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "implicit",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
