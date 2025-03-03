import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createBrowserClient() {
  return createSupabaseClient(
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL!
      : process.env.NEXT_PUBLIC_SUPABASE_DEV_URL!,
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_DEV_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}
