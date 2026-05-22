import { pgTable, text, serial, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";

export const coachPlansTable = pgTable("coach_plans", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  durationMonths: integer("duration_months").notNull(),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  polarProductId: text("polar_product_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CoachPlan = typeof coachPlansTable.$inferSelect;
