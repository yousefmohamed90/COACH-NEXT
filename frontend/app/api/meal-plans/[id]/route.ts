import { NextRequest, NextResponse } from "next/server";
import { getDb, mealPlansTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { GetMealPlanParams, UpdateMealPlanBody, UpdateMealPlanParams, DeleteMealPlanParams } from "@trainova/schemas";
import { requireAuth } from "@/lib/server/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const p = GetMealPlanParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const [plan] = await getDb().select().from(mealPlansTable).where(
    and(eq(mealPlansTable.id, p.data.id), eq(mealPlansTable.coachId, session.userId))
  );
  if (!plan) return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const p = UpdateMealPlanParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const parsed = UpdateMealPlanBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const [plan] = await getDb().update(mealPlansTable)
    .set(parsed.data)
    .where(and(eq(mealPlansTable.id, p.data.id), eq(mealPlansTable.coachId, session.userId)))
    .returning();
  if (!plan) return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const p = DeleteMealPlanParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const [deleted] = await getDb().delete(mealPlansTable)
    .where(and(eq(mealPlansTable.id, p.data.id), eq(mealPlansTable.coachId, session.userId)))
    .returning();
  if (!deleted) return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
