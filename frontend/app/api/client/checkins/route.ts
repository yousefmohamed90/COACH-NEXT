import { NextRequest, NextResponse } from "next/server";
import { db, checkinsTable } from "@trainova/database";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session?.clientId) return NextResponse.json({ error: "Not authenticated as client" }, { status: 401 });

  const checkins = await db.select()
    .from(checkinsTable)
    .where(eq(checkinsTable.clientId, session.clientId))
    .orderBy(desc(checkinsTable.date));

  return NextResponse.json(checkins);
}
