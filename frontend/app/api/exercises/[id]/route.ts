import { NextRequest, NextResponse } from "next/server";
import { db, exercisesTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { UpdateExerciseParams, UpdateExerciseBody, DeleteExerciseParams } from "@trainova/schemas";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const p = UpdateExerciseParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const parsed = UpdateExerciseBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [exercise] = await db.update(exercisesTable)
    .set(parsed.data).where(eq(exercisesTable.id, p.data.id)).returning();
  if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  return NextResponse.json(exercise);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const p = DeleteExerciseParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });

  const [deleted] = await db.delete(exercisesTable).where(eq(exercisesTable.id, p.data.id)).returning();
  if (!deleted) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
