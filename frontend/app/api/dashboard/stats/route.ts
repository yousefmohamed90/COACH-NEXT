import { NextRequest, NextResponse } from "next/server";
import { getDb, clientsTable, subscriptionsTable, checkinsTable, workoutPlansTable, mealPlansTable } from "@trainova/database";
import { eq, and, gte, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [clients, activeSubs, allSubs, weekCheckins, workoutPlans, mealPlans, recentCheckins] = await Promise.all([
    getDb().select().from(clientsTable).where(eq(clientsTable.coachId, session.userId)),
    getDb().select().from(subscriptionsTable).where(
      and(eq(subscriptionsTable.coachId, session.userId), eq(subscriptionsTable.status, "active"))
    ),
    getDb().select().from(subscriptionsTable).where(
      and(eq(subscriptionsTable.coachId, session.userId), eq(subscriptionsTable.status, "active"))
    ),
    getDb().select().from(checkinsTable).where(
      and(eq(checkinsTable.coachId, session.userId),
        gte(checkinsTable.date, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
    ),
    getDb().select().from(workoutPlansTable).where(eq(workoutPlansTable.coachId, session.userId)),
    getDb().select().from(mealPlansTable).where(eq(mealPlansTable.coachId, session.userId)),
    getDb().select().from(checkinsTable).where(eq(checkinsTable.coachId, session.userId)),
  ]);

  const monthlyRevenue = activeSubs.reduce((sum, s) => sum + (s.priceMonthly ?? 0), 0);
  const moodScores = recentCheckins.filter(c => c.moodScore != null).map(c => c.moodScore!);
  const avgMood = moodScores.length > 0 ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length : null;
  const mealsFollowed = recentCheckins.filter(c => c.mealsFollowed).length;
  const nutritionRate = recentCheckins.length > 0 ? (mealsFollowed / recentCheckins.length) * 100 : 0;

  return NextResponse.json({
    totalClients: clients.length,
    activeSubscriptions: activeSubs.length,
    monthlyRevenue,
    checkinsThisWeek: weekCheckins.length,
    workoutPlansCount: workoutPlans.length,
    mealPlansCount: mealPlans.length,
    avgClientMoodScore: avgMood,
    nutritionComplianceRate: Math.round(nutritionRate),
  });
}
