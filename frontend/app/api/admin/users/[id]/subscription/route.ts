import { NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

async function isAdmin(userId: number): Promise<boolean> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user?.role === "admin";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session || !(await isAdmin(session.userId)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const targetId = parseInt(id, 10);
  if (isNaN(targetId)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const { subscriptionStatus } = body;
  if (!subscriptionStatus || typeof subscriptionStatus !== "string")
    return NextResponse.json({ error: "subscriptionStatus is required" }, { status: 400 });

  const validStatuses = ["trial", "active", "expired", "canceled"];
  if (!validStatuses.includes(subscriptionStatus))
    return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });

  const [updated] = await db.update(usersTable)
    .set({ subscriptionStatus })
    .where(eq(usersTable.id, targetId))
    .returning();

  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ success: true, user: updated });
}
