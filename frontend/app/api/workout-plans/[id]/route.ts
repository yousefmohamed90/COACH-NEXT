import { NextRequest, NextResponse } from "next/server";
import { db, workoutPlansTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { GetWorkoutPlanParams, UpdateWorkoutPlanBody, UpdateWorkoutPlanParams, DeleteWorkoutPlanParams } from "@trainova/schemas";
import { requireAuth } from "@/lib/server/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const p = GetWorkoutPlanParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });

  const [plan] = await db.select().from(workoutPlansTable).where(
    and(eq(workoutPlansTable.id, p.data.id), eq(workoutPlansTable.coachId, session.userId))
  );
  if (!plan) return NextResponse.json({ error: "Workout plan not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const p = UpdateWorkoutPlanParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const parsed = UpdateWorkoutPlanBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [plan] = await db.update(workoutPlansTable)
    .set(parsed.data)
    .where(and(eq(workoutPlansTable.id, p.data.id), eq(workoutPlansTable.coachId, session.userId)))
    .returning();
  if (!plan) return NextResponse.json({ error: "Workout plan not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const p = DeleteWorkoutPlanParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });

  const [deleted] = await db.delete(workoutPlansTable)
    .where(and(eq(workoutPlansTable.id, p.data.id), eq(workoutPlansTable.coachId, session.userId)))
    .returning();
  if (!deleted) return NextResponse.json({ error: "Workout plan not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
