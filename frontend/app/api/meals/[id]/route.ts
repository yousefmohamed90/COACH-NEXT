import { NextRequest, NextResponse } from "next/server";
import { db, mealsTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { UpdateMealParams, UpdateMealBody, DeleteMealParams } from "@trainova/schemas";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const p = UpdateMealParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const parsed = UpdateMealBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const [meal] = await db.update(mealsTable).set(parsed.data).where(eq(mealsTable.id, p.data.id)).returning();
  if (!meal) return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  return NextResponse.json(meal);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const p = DeleteMealParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const [deleted] = await db.delete(mealsTable).where(eq(mealsTable.id, p.data.id)).returning();
  if (!deleted) return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
