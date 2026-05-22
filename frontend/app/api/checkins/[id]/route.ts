import { NextRequest, NextResponse } from "next/server";
import { db, checkinsTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { GetCheckinParams, UpdateCheckinBody, UpdateCheckinParams, DeleteCheckinParams } from "@trainova/schemas";
import { requireAuth } from "@/lib/server/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const p = GetCheckinParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const [checkin] = await db.select().from(checkinsTable).where(
    and(eq(checkinsTable.id, p.data.id), eq(checkinsTable.coachId, session.userId))
  );
  if (!checkin) return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  return NextResponse.json(checkin);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const p = UpdateCheckinParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const parsed = UpdateCheckinBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const [checkin] = await db.update(checkinsTable)
    .set(parsed.data)
    .where(and(eq(checkinsTable.id, p.data.id), eq(checkinsTable.coachId, session.userId)))
    .returning();
  if (!checkin) return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  return NextResponse.json(checkin);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const p = DeleteCheckinParams.safeParse({ id: parseInt(id, 10) });
  if (!p.success) return NextResponse.json({ error: p.error.message }, { status: 400 });
  const [deleted] = await db.delete(checkinsTable)
    .where(and(eq(checkinsTable.id, p.data.id), eq(checkinsTable.coachId, session.userId)))
    .returning();
  if (!deleted) return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
