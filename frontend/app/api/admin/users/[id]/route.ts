import { NextRequest, NextResponse } from "next/server";
import { getDb, usersTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

async function isAdmin(userId: number): Promise<boolean> {
  const [user] = await getDb().select().from(usersTable).where(eq(usersTable.id, userId));
  return user?.role === "admin";
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session || !(await isAdmin(session.userId)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const targetId = parseInt(id, 10);
  if (isNaN(targetId)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

  await getDb().delete(usersTable).where(eq(usersTable.id, targetId));
  return NextResponse.json({ success: true });
}
