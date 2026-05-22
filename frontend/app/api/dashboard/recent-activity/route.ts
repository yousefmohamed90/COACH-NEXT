import { NextRequest, NextResponse } from "next/server";
import { db, clientsTable, checkinsTable, subscriptionsTable } from "@trainova/database";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [recentCheckins, recentClients, recentSubs] = await Promise.all([
    db.select({ id: checkinsTable.id, clientId: checkinsTable.clientId, date: checkinsTable.createdAt, workoutCompleted: checkinsTable.workoutCompleted })
      .from(checkinsTable)
      .where(eq(checkinsTable.coachId, session.userId))
      .orderBy(sql`${checkinsTable.createdAt} DESC`)
      .limit(5),
    db.select({ id: clientsTable.id, name: clientsTable.name, createdAt: clientsTable.createdAt })
      .from(clientsTable)
      .where(eq(clientsTable.coachId, session.userId))
      .orderBy(sql`${clientsTable.createdAt} DESC`)
      .limit(3),
    db.select({ id: subscriptionsTable.id, clientId: subscriptionsTable.clientId, plan: subscriptionsTable.plan, createdAt: subscriptionsTable.createdAt })
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.coachId, session.userId))
      .orderBy(sql`${subscriptionsTable.createdAt} DESC`)
      .limit(3),
  ]);

  const clientMap: Record<number, string> = {};
  const allClientIds = [...new Set([...recentCheckins.map(c => c.clientId), ...recentSubs.map(s => s.clientId)])];

  if (allClientIds.length > 0) {
    const clients = await db.select({ id: clientsTable.id, name: clientsTable.name })
      .from(clientsTable)
      .where(eq(clientsTable.coachId, session.userId));
    for (const c of clients) clientMap[c.id] = c.name;
  }

  const activities = [
    ...recentCheckins.map((c, i) => ({
      id: i + 1, type: "checkin",
      description: `Check-in submitted${c.workoutCompleted ? " — workout completed" : ""}`,
      clientName: clientMap[c.clientId] ?? null, createdAt: c.date,
    })),
    ...recentClients.map((c, i) => ({
      id: 100 + i, type: "client",
      description: `New client added: ${c.name}`, clientName: c.name, createdAt: c.createdAt,
    })),
    ...recentSubs.map((s, i) => ({
      id: 200 + i, type: "subscription",
      description: `Subscription started: ${s.plan}`, clientName: clientMap[s.clientId] ?? null, createdAt: s.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  return NextResponse.json(activities);
}
