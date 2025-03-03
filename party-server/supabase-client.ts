/*
<ai_context>
Supabase client for server-side usage in PartyKit server.
</ai_context>
<recent_changes>
Created Supabase service client for server-side operations.
</recent_changes>
*/

import { createClient } from "@supabase/supabase-js";

// These environment variables must be set in your PartyKit deployment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const createServiceClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
