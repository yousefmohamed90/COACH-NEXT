import { NextRequest, NextResponse } from "next/server";
import { getDb, usersTable } from "@trainova/database";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [user] = await getDb().select().from(usersTable).where(eq(usersTable.id, session.userId));
  if (user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await getDb().select({
    id: usersTable.id, email: usersTable.email, name: usersTable.name,
    role: usersTable.role, subscriptionStatus: usersTable.subscriptionStatus,
    createdAt: usersTable.createdAt, updatedAt: usersTable.updatedAt,
  }).from(usersTable).orderBy(usersTable.createdAt);

  return NextResponse.json(users);
}
