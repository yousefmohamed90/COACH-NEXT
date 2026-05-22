import { NextRequest, NextResponse } from "next/server";
import { db, clientsTable, checkinsTable } from "@trainova/database";
import { eq, and, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const checkins = await db.select().from(checkinsTable).where(
    and(eq(checkinsTable.coachId, session.userId), gte(checkinsTable.date, thirtyDaysAgo))
  );

  const byDate: Record<string, { count: number; moods: number[]; energies: number[] }> = {};
  for (const c of checkins) {
    const day = c.date.toISOString().split("T")[0];
    if (!byDate[day]) byDate[day] = { count: 0, moods: [], energies: [] };
    byDate[day].count++;
    if (c.moodScore != null) byDate[day].moods.push(c.moodScore);
    if (c.energyLevel != null) byDate[day].energies.push(c.energyLevel);
  }

  const points = Object.entries(byDate).map(([date, data]) => ({
    date, count: data.count,
    avgMood: data.moods.length > 0 ? data.moods.reduce((a, b) => a + b, 0) / data.moods.length : null,
    avgEnergy: data.energies.length > 0 ? data.energies.reduce((a, b) => a + b, 0) / data.energies.length : null,
  })).sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json(points);
}
