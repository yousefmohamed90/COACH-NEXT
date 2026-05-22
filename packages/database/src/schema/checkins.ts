import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const checkinsTable = pgTable("checkins", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  coachId: integer("coach_id").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  weightKg: real("weight_kg"),
  energyLevel: integer("energy_level"),
  moodScore: integer("mood_score"),
  sleepHours: real("sleep_hours"),
  workoutCompleted: boolean("workout_completed").notNull().default(false),
  mealsFollowed: boolean("meals_followed").notNull().default(false),
  waterMl: integer("water_ml"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCheckinSchema = createInsertSchema(checkinsTable).omit({ id: true, createdAt: true });
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Checkin = typeof checkinsTable.$inferSelect;
