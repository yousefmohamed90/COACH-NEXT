import { NextRequest, NextResponse } from "next/server";
import { getDb, exercisesTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { ListExercisesParams, CreateExerciseParams, CreateExerciseBody } from "@trainova/schemas";
import { requireAuth } from "@/lib/server/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const planId = (await params).id;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const p = ListExercisesParams.safeParse({ planId: parseInt(planId, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });

  const exercises = await getDb().select().from(exercisesTable).where(eq(exercisesTable.workoutPlanId, p.data.planId));
  return NextResponse.json(exercises);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const planId = (await params).id;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const p = CreateExerciseParams.safeParse({ planId: parseInt(planId, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const parsed = CreateExerciseBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [exercise] = await getDb().insert(exercisesTable).values({
    ...parsed.data, workoutPlanId: p.data.planId,
    orderIndex: parsed.data.orderIndex ?? 0,
  }).returning();
  return NextResponse.json(exercise, { status: 201 });
}
