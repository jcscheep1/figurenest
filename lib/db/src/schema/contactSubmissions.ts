import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const contactSubmissionsTable = pgTable("contact_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  reason: text("reason").notNull(),
  pageUrl: text("page_url"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissionsTable.$inferSelect;