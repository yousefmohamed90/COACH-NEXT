import { NextRequest, NextResponse } from "next/server";
import { getDb, usersTable, clientsTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/server/session";

export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [user] = await getDb().select().from(usersTable).where(eq(usersTable.id, session.userId));
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  let clientId = null;
  if (user.role === "client") {
    const [client] = await getDb().select().from(clientsTable).where(eq(clientsTable.userId, user.id));
    clientId = client?.id ?? null;
  }

  return NextResponse.json({
    id: user.id, email: user.email, name: user.name, slug: user.slug,
    role: user.role, subscriptionStatus: user.subscriptionStatus,
    trialEndsAt: user.trialEndsAt,
    clientId, createdAt: user.createdAt,
  });
}
