import { NextRequest, NextResponse } from "next/server";
import { db, subscriptionsTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { CreateSubscriptionBody } from "@trainova/schemas";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const subs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.coachId, session.userId));
  return NextResponse.json(subs);
}

export async function POST(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const parsed = CreateSubscriptionBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const [sub] = await db.insert(subscriptionsTable).values({
    ...parsed.data, coachId: session.userId,
    status: parsed.data.status ?? "active",
  }).returning();
  return NextResponse.json(sub, { status: 201 });
}
