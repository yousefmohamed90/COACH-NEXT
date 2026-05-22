import { NextRequest, NextResponse } from "next/server";
import { getDb, clientsTable, checkinsTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const clientIdRaw = request.nextUrl.searchParams.get("clientId");
  const clientId = clientIdRaw ? parseInt(clientIdRaw, 10) : null;

  let checkins;
  if (clientId && !isNaN(clientId)) {
    checkins = await getDb().select().from(checkinsTable).where(
      and(eq(checkinsTable.coachId, session.userId), eq(checkinsTable.clientId, clientId))
    );
  } else {
    checkins = await getDb().select().from(checkinsTable).where(eq(checkinsTable.coachId, session.userId));
  }

  const withWeight = checkins.filter(c => c.weightKg != null);
  const clients = await getDb().select({ id: clientsTable.id, name: clientsTable.name })
    .from(clientsTable).where(eq(clientsTable.coachId, session.userId));
  const clientMap: Record<number, string> = {};
  for (const c of clients) clientMap[c.id] = c.name;

  const points = withWeight.map(c => ({
    date: c.date.toISOString().split("T")[0],
    weightKg: c.weightKg!,
    clientName: clientMap[c.clientId] ?? "Unknown",
  })).sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json(points);
}
