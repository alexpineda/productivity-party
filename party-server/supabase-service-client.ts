import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createServiceClient() {
  return createSupabaseClient(
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL!
      : process.env.NEXT_PUBLIC_SUPABASE_DEV_URL!,
    process.env.NODE_ENV === "production"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY!
      : process.env.SUPABASE_SERVICE_ROLE_DEV_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}
