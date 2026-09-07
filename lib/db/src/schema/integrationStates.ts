import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const integrationStatesTable = pgTable("integration_states", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id),
  provider: text("provider").notNull(),
  status: text("status").notNull().default("not_connected"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [unique("integration_project_provider_unique").on(table.projectId, table.provider)]);

export const insertIntegrationStateSchema = createInsertSchema(integrationStatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIntegrationState = z.infer<typeof insertIntegrationStateSchema>;
export type IntegrationState = typeof integrationStatesTable.$inferSelect;