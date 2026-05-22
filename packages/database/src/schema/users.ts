import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("coach"),
  slug: text("slug").unique(),
  customDomain: text("custom_domain"),
  polarApiKey: text("polar_api_key"),
  bio: text("bio"),
  logoUrl: text("logo_url"),
  welcomeMessage: text("welcome_message"),
  brandColor: text("brand_color"),
  socialLinks: text("social_links"),
  subscriptionStatus: text("subscription_status").default("inactive"),
  polarPurchaseId: text("polar_purchase_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
