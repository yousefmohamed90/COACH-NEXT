import { NextRequest, NextResponse } from "next/server";
import { getDb, clientsTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { GetClientParams, UpdateClientBody, UpdateClientParams, DeleteClientParams } from "@trainova/schemas";
import { requireAuth } from "@/lib/server/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = GetClientParams.safeParse({ id: parseInt(id, 10) });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [client] = await getDb().select().from(clientsTable).where(
    and(eq(clientsTable.id, parsed.data.id), eq(clientsTable.coachId, session.userId))
  );
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const paramsParsed = UpdateClientParams.safeParse({ id: parseInt(id, 10) });
  if (!paramsParsed.success) return NextResponse.json({ error: paramsParsed.error.message }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const parsed = UpdateClientBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [client] = await getDb().update(clientsTable)
    .set(parsed.data)
    .where(and(eq(clientsTable.id, paramsParsed.data.id), eq(clientsTable.coachId, session.userId)))
    .returning();
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = DeleteClientParams.safeParse({ id: parseInt(id, 10) });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [deleted] = await getDb().delete(clientsTable)
    .where(and(eq(clientsTable.id, parsed.data.id), eq(clientsTable.coachId, session.userId)))
    .returning();
  if (!deleted) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
