import { NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { RegisterBody } from "@trainova/schemas";
import { hashPassword } from "@/lib/server/auth";
import { saveSession } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = RegisterBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    email, passwordHash, name, role: "coach",
    subscriptionStatus: "inactive",
  }).returning();

  const res = NextResponse.json({
    user: {
      id: user.id, email: user.email, name: user.name,
      role: user.role, subscriptionStatus: user.subscriptionStatus,
      createdAt: user.createdAt,
    },
  }, { status: 201 });

  saveSession(res, { userId: user.id, role: user.role });
  return res;
}
