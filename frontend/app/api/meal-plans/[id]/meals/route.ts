import { NextRequest, NextResponse } from "next/server";
import { db, mealsTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { ListMealsParams, CreateMealParams, CreateMealBody } from "@trainova/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const planId = (await params).id;
  const p = ListMealsParams.safeParse({ planId: parseInt(planId, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const meals = await db.select().from(mealsTable).where(eq(mealsTable.mealPlanId, p.data.planId));
  return NextResponse.json(meals);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const planId = (await params).id;
  const p = CreateMealParams.safeParse({ planId: parseInt(planId, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const parsed = CreateMealBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const [meal] = await db.insert(mealsTable).values({
    ...parsed.data, mealPlanId: p.data.planId,
    orderIndex: parsed.data.orderIndex ?? 0,
  }).returning();
  return NextResponse.json(meal, { status: 201 });
}
