/**
 * Client safe config exports
 */

export const PARTYKIT_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "your-project.username.partykit.dev"
    : "http://localhost:1999";

export const PRODUCTIVITY_SCORE_UPDATE_INTERVAL = 5;

export const SCREENPIPE_API_URL = "http://localhost:3030";

export const SUPABASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "http://localhost:54321";
export const SUPABASE_ANON_KEY =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_DEV_KEY;
