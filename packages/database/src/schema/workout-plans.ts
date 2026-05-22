import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workoutPlansTable = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  clientId: integer("client_id"),
  title: text("title").notNull(),
  description: text("description"),
  durationWeeks: integer("duration_weeks"),
  isTemplate: boolean("is_template").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const exercisesTable = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutPlanId: integer("workout_plan_id").notNull(),
  name: text("name").notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  restSeconds: integer("rest_seconds"),
  notes: text("notes"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlansTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type WorkoutPlan = typeof workoutPlansTable.$inferSelect;

export const insertExerciseSchema = createInsertSchema(exercisesTable).omit({ id: true });
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercisesTable.$inferSelect;
