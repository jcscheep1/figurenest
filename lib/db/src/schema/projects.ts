import { integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ownersTable } from "./owners";

export const projectsTable = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull().references(() => ownersTable.id),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  status: text("status").notNull().default("active"),
  constructionToolCount: integer("construction_tool_count").notNull().default(0),
  publicRouteCount: integer("public_route_count"),
  analyticsStatus: text("analytics_status").notNull().default("not_connected"),
  revenueStatus: text("revenue_status").notNull().default("not_connected"),
  indexingStatus: text("indexing_status").notNull().default("not_connected"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [unique("project_owner_domain_unique").on(table.ownerId, table.domain)]);

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;