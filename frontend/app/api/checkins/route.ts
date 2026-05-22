import { NextRequest, NextResponse } from "next/server";
import { getDb, checkinsTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { CreateCheckinBody, ListCheckinsQueryParams } from "@trainova/schemas";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const queryParams = ListCheckinsQueryParams.safeParse({
    clientId: request.nextUrl.searchParams.get("clientId"),
  });
  if (!queryParams.success) return NextResponse.json({ error: queryParams.error.message }, { status: 400 });

  let checkins;
  if (queryParams.data.clientId) {
    checkins = await getDb().select().from(checkinsTable).where(
      and(eq(checkinsTable.coachId, session.userId), eq(checkinsTable.clientId, queryParams.data.clientId))
    );
  } else {
    checkins = await getDb().select().from(checkinsTable).where(eq(checkinsTable.coachId, session.userId));
  }
  return NextResponse.json(checkins);
}

export async function POST(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = CreateCheckinBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [checkin] = await getDb().insert(checkinsTable).values({
    ...parsed.data, coachId: session.userId,
    workoutCompleted: parsed.data.workoutCompleted ?? false,
    mealsFollowed: parsed.data.mealsFollowed ?? false,
  }).returning();
  return NextResponse.json(checkin, { status: 201 });
}
