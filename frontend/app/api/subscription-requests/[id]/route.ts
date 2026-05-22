import { NextRequest, NextResponse } from "next/server";
import { getDb, subscriptionRequestsTable, usersTable, clientsTable, subscriptionsTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { requireAuth, hashPassword } from "@/lib/server/auth";

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
  const { status, notes } = body;
  if (!["pending", "approved", "rejected"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const update: Record<string, unknown> = { status };
  if (typeof notes === "string") update.notes = notes;

  const [updated] = await getDb().update(subscriptionRequestsTable)
    .set(update)
    .where(and(eq(subscriptionRequestsTable.id, idNum), eq(subscriptionRequestsTable.coachId, session.userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If approving, create client user account
  let credentials = null;
  if (status === "approved") {
    const tempPassword = Math.random().toString(36).slice(2, 10) + "A1!";
    const passwordHash = hashPassword(tempPassword);

    const [user] = await getDb().insert(usersTable).values({
      email: updated.email,
      passwordHash,
      name: updated.name,
      role: "client",
    }).returning();

    const [client] = await getDb().insert(clientsTable).values({
      coachId: session.userId,
      userId: user.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
    }).returning();

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 3);

    await getDb().insert(subscriptionsTable).values({
      clientId: client.id,
      coachId: session.userId,
      plan: updated.package,
      priceMonthly: 0,
      status: "active",
      startDate: now,
      endDate,
    }).returning();

    credentials = { email: updated.email, password: tempPassword };
  }

  return NextResponse.json({ ...updated, credentials });
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

  const [deleted] = await getDb().delete(subscriptionRequestsTable)
    .where(and(eq(subscriptionRequestsTable.id, idNum), eq(subscriptionRequestsTable.coachId, session.userId)))
    .returning();

  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
