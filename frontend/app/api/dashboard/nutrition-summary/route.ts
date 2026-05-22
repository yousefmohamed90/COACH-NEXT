import { NextRequest, NextResponse } from "next/server";
import { getDb, mealPlansTable, checkinsTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [mealPlans, checkins] = await Promise.all([
    getDb().select().from(mealPlansTable).where(eq(mealPlansTable.coachId, session.userId)),
    getDb().select().from(checkinsTable).where(eq(checkinsTable.coachId, session.userId)),
  ]);

  const plansWithCalories = mealPlans.filter(p => p.targetCalories != null);
  const avgCalories = plansWithCalories.length > 0
    ? plansWithCalories.reduce((sum, p) => sum + p.targetCalories!, 0) / plansWithCalories.length
    : null;

  const plansWithProtein = mealPlans.filter(p => p.targetProteinG != null);
  const avgProtein = plansWithProtein.length > 0
    ? plansWithProtein.reduce((sum, p) => sum + p.targetProteinG!, 0) / plansWithProtein.length
    : null;

  const followed = checkins.filter(c => c.mealsFollowed).length;
  const compliance = checkins.length > 0 ? (followed / checkins.length) * 100 : 0;

  return NextResponse.json({
    totalMealPlans: mealPlans.length,
    avgCaloriesTarget: avgCalories,
    avgProteinTarget: avgProtein,
    complianceRate: Math.round(compliance),
    topGoals: ["Weight loss", "Muscle gain", "Maintenance"],
  });
}
