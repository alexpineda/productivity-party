-- Drop the existing unique constraint on user_id
ALTER TABLE "public"."scoreboard"
DROP CONSTRAINT IF EXISTS "scoreboard_user_id_key";

-- Add a new composite unique constraint on user_id and month
ALTER TABLE "public"."scoreboard" ADD CONSTRAINT "scoreboard_user_id_month_key" UNIQUE ("user_id", "month");

-- Comment explaining the change
COMMENT ON CONSTRAINT "scoreboard_user_id_month_key" ON "public"."scoreboard" IS 'Allows multiple entries per user across different months, but ensures only one entry per user per month';