import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const platformPurchasesTable = pgTable("platform_purchases", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  polarCheckoutId: text("polar_checkout_id"),
  polarSubscriptionId: text("polar_subscription_id"),
  amount: real("amount").notNull().default(200),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlatformPurchaseSchema = createInsertSchema(platformPurchasesTable).omit({ id: true, createdAt: true });
export type InsertPlatformPurchase = z.infer<typeof insertPlatformPurchaseSchema>;
export type PlatformPurchase = typeof platformPurchasesTable.$inferSelect;
