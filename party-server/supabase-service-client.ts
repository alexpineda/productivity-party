import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type * as Party from "partykit/server";

export async function createServiceClient(room: Party.Room) {
  const url = room?.env?.SUPABASE_URL as string;
  const key = room?.env?.SUPABASE_SERVICE_ROLE_KEY as string;

  // const url = room?.env?.SUPABASE_DEV_URL as string;
  // const key = room?.env?.SUPABASE_SERVICE_ROLE_DEV_KEY as string;

  // const url = isDevelopment
  //   ? (room?.env?.SUPABASE_DEV_URL as string)
  //   : (room?.env?.SUPABASE_URL as string);
  // const key = isDevelopment
  //   ? (room?.env?.SUPABASE_SERVICE_ROLE_DEV_KEY as string)
  //   : (room?.env?.SUPABASE_SERVICE_ROLE_KEY as string);

  return createSupabaseClient(url!, key!, {
    auth: {
      persistSession: false,
    },
  });
}
