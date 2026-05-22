import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mealPlansTable = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  clientId: integer("client_id"),
  title: text("title").notNull(),
  description: text("description"),
  targetCalories: integer("target_calories"),
  targetProteinG: integer("target_protein_g"),
  targetCarbsG: integer("target_carbs_g"),
  targetFatG: integer("target_fat_g"),
  targetWaterMl: integer("target_water_ml"),
  isTemplate: boolean("is_template").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const mealsTable = pgTable("meals", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id").notNull(),
  name: text("name").notNull(),
  mealType: text("meal_type").notNull(),
  calories: integer("calories"),
  proteinG: integer("protein_g"),
  carbsG: integer("carbs_g"),
  fatG: integer("fat_g"),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const insertMealPlanSchema = createInsertSchema(mealPlansTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlansTable.$inferSelect;

export const insertMealSchema = createInsertSchema(mealsTable).omit({ id: true });
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof mealsTable.$inferSelect;
