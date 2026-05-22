import { NextRequest, NextResponse } from "next/server";
import { db, clientsTable, checkinsTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  const session = requireAuth(request);
  if (!session?.clientId) return NextResponse.json({ error: "Not authenticated as client" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { weightKg, moodScore, energyLevel, sleepHours, workoutCompleted, mealsFollowed, waterMl, notes } = body;

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, session.clientId));
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const [checkin] = await db.insert(checkinsTable).values({
    clientId: session.clientId, coachId: client.coachId, date: new Date(),
    weightKg: weightKg ? parseFloat(weightKg) : null,
    moodScore: moodScore ? parseInt(moodScore, 10) : null,
    energyLevel: energyLevel ? parseInt(energyLevel, 10) : null,
    sleepHours: sleepHours ? parseFloat(sleepHours) : null,
    workoutCompleted: workoutCompleted ?? false,
    mealsFollowed: mealsFollowed ?? false,
    waterMl: waterMl ? parseInt(waterMl, 10) : null,
    notes: notes ?? null,
  }).returning();

  return NextResponse.json(checkin, { status: 201 });
}
