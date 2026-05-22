import { NextRequest, NextResponse } from "next/server";
import { getDb, clientsTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session?.clientId) return NextResponse.json({ error: "Not authenticated as client" }, { status: 401 });

  const [client] = await getDb().select().from(clientsTable).where(eq(clientsTable.id, session.clientId));
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json(client);
}
