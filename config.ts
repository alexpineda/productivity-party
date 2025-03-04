/**
 * Client safe config exports
 */

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = !isProduction;

export const PARTYKIT_SERVER_URL = isProduction
  ? "https://productivity-party.alexpineda.partykit.dev"
  : "http://localhost:1999";

export const PRODUCTIVITY_SCORE_UPDATE_INTERVAL = 5;

export const SCREENPIPE_API_URL = "http://localhost:3030";

export const SUPABASE_URL = isProduction
  ? process.env.SUPABASE_URL
  : "http://localhost:54321";
