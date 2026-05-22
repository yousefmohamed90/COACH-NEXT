import { NextRequest, NextResponse } from "next/server";
import { db, coachPlansTable, usersTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const plans = await db.select().from(coachPlansTable).where(eq(coachPlansTable.coachId, session.userId));
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { name, description, durationMonths, price, currency, polarProductId } = body;

  if (!name || typeof name !== "string")
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  const dur = parseInt(durationMonths, 10);
  if (isNaN(dur) || dur < 1)
    return NextResponse.json({ error: "Duration required" }, { status: 400 });
  const pr = parseFloat(price);
  if (isNaN(pr) || pr < 0)
    return NextResponse.json({ error: "Price required" }, { status: 400 });

  const [plan] = await db.insert(coachPlansTable).values({
    coachId: session.userId, name: name.trim(),
    description: description ?? null, durationMonths: dur, price: pr,
    currency: currency ?? "USD", polarProductId: polarProductId ?? null, isActive: true,
  }).returning();
  return NextResponse.json(plan, { status: 201 });
}
