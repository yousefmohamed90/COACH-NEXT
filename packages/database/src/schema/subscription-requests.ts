import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscriptionRequestsTable = pgTable("subscription_requests", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  countryCode: text("country_code").notNull().default("+966"),
  package: text("package").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSubscriptionRequestSchema = createInsertSchema(subscriptionRequestsTable).omit({ id: true, createdAt: true, status: true, coachId: true });
export type InsertSubscriptionRequest = z.infer<typeof insertSubscriptionRequestSchema>;
export type SubscriptionRequest = typeof subscriptionRequestsTable.$inferSelect;
