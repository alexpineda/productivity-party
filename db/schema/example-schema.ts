import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { projectsTable } from "./projects-schema";

/**
 * messagesTable: The main table storing individual messages tied to a chat session.
 */
export const examplesTable = sqliteTable("examples", {
  /**
   * Unique primary key for the message.
   * Using text to store UUID string.
   */
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),

  /**
   * Creation timestamp, defaults to 'now' at row insertion.
   */
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),

  /**
   * Update timestamp, defaults to 'now' and auto-updates when row changes.
   */
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/**
 * InsertMessage: Type used for inserting new rows into messages.
 */
export type InsertMessage = typeof examplesTable.$inferInsert;

/**
 * SelectMessage: Type used for selecting rows from messages.
 */
export type SelectMessage = typeof examplesTable.$inferSelect;
