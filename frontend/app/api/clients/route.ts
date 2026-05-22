import { NextRequest, NextResponse } from "next/server";
import { db, clientsTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { CreateClientBody } from "@trainova/schemas";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const clients = await db.select().from(clientsTable).where(eq(clientsTable.coachId, session.userId));
  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = CreateClientBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [client] = await db.insert(clientsTable).values({ ...parsed.data, coachId: session.userId }).returning();
  return NextResponse.json(client, { status: 201 });
}
