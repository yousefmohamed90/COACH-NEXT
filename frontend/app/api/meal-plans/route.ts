import { NextRequest, NextResponse } from "next/server";
import { db, mealPlansTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { CreateMealPlanBody } from "@trainova/schemas";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const plans = await db.select().from(mealPlansTable).where(eq(mealPlansTable.coachId, session.userId));
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = CreateMealPlanBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [plan] = await db.insert(mealPlansTable).values({
    ...parsed.data, coachId: session.userId,
    isTemplate: parsed.data.isTemplate ?? false,
  }).returning();
  return NextResponse.json(plan, { status: 201 });
}
