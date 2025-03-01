/*
Configures Drizzle for the app.
*/

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: { url: process.env.DATABASE_URL ?? "file:./specloop.db" },
});
