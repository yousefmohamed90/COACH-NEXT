import { NextRequest, NextResponse } from "next/server";
import { db, coachPlansTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const { name, description, durationMonths, price, currency, polarProductId, isActive } = body;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (durationMonths !== undefined) update.durationMonths = parseInt(durationMonths, 10);
  if (price !== undefined) update.price = parseFloat(price);
  if (currency !== undefined) update.currency = currency;
  if (polarProductId !== undefined) update.polarProductId = polarProductId || null;
  if (isActive !== undefined) update.isActive = Boolean(isActive);

  const [updated] = await db.update(coachPlansTable)
    .set(update)
    .where(and(eq(coachPlansTable.id, idNum), eq(coachPlansTable.coachId, session.userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const [deleted] = await db.delete(coachPlansTable)
    .where(and(eq(coachPlansTable.id, idNum), eq(coachPlansTable.coachId, session.userId)))
    .returning();

  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
