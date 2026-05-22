import { NextRequest, NextResponse } from "next/server";
import { db, subscriptionsTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { UpdateSubscriptionBody, UpdateSubscriptionParams, DeleteSubscriptionParams } from "@trainova/schemas";
import { requireAuth } from "@/lib/server/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const p = UpdateSubscriptionParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const parsed = UpdateSubscriptionBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const [sub] = await db.update(subscriptionsTable)
    .set(parsed.data)
    .where(and(eq(subscriptionsTable.id, p.data.id), eq(subscriptionsTable.coachId, session.userId)))
    .returning();
  if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  return NextResponse.json(sub);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const p = DeleteSubscriptionParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const [deleted] = await db.delete(subscriptionsTable)
    .where(and(eq(subscriptionsTable.id, p.data.id), eq(subscriptionsTable.coachId, session.userId)))
    .returning();
  if (!deleted) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
