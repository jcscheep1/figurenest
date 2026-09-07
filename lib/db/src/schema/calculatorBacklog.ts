import { integer, jsonb, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type CalculatorBacklogStatus =
  | "backlog"
  | "skipped_existing"
  | "in_progress"
  | "implemented"
  | "failed";

export const calculatorBacklogTable = pgTable("calculator_backlog", {
  id: uuid("id").defaultRandom().primaryKey(),
  researchId: integer("research_id").notNull(),
  calculatorName: text("calculator_name").notNull(),
  category: text("category").notNull(),
  targetKeyword: text("target_keyword").notNull(),
  secondaryKeywordCluster: text("secondary_keyword_cluster").array().notNull(),
  recommendedUrl: text("recommended_url").notNull(),
  title: text("title").notNull(),
  metaDescription: text("meta_description").notNull(),
  pageSections: text("page_sections").array().notNull(),
  schemaRecommendation: text("schema_recommendation").array().notNull(),
  priority: integer("priority").notNull(),
  implementationOrder: integer("implementation_order").notNull(),
  status: text("status").$type<CalculatorBacklogStatus>().notNull().default("backlog"),
  existingUrl: text("existing_url"),
  competitorSlug: text("competitor_slug").notNull(),
  sourceUrl: text("source_url").notNull(),
  searchIntent: text("search_intent").notNull(),
  priorityBasis: text("priority_basis").notNull(),
  researchNotes: text("research_notes"),
  sourceSnapshot: jsonb("source_snapshot").$type<Record<string, unknown>>().notNull(),
  researchDate: text("research_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  unique("calculator_backlog_research_id_unique").on(table.researchId),
]);

export const insertCalculatorBacklogSchema = createInsertSchema(calculatorBacklogTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCalculatorBacklog = z.infer<typeof insertCalculatorBacklogSchema>;
export type CalculatorBacklog = typeof calculatorBacklogTable.$inferSelect;