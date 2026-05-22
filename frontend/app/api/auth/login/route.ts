import { NextRequest, NextResponse } from "next/server";
import { getDb, usersTable, clientsTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { LoginBody } from "@trainova/schemas";
import { verifyPassword } from "@/lib/server/auth";
import { saveSession } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = LoginBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const [user] = await getDb().select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  let clientId = null;
  if (user.role === "client") {
    const [client] = await getDb().select().from(clientsTable).where(eq(clientsTable.userId, user.id));
    clientId = client?.id ?? null;
  }

  const res = NextResponse.json({
    user: {
      id: user.id, email: user.email, name: user.name,
      role: user.role, subscriptionStatus: user.subscriptionStatus,
      clientId, createdAt: user.createdAt,
    },
  });

  saveSession(res, { userId: user.id, role: user.role, clientId: clientId ?? undefined });
  return res;
}
