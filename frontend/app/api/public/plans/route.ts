import { NextRequest, NextResponse } from "next/server";
import { getDb, coachPlansTable, usersTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawCoachId = searchParams.get("coachId");
  const slug = searchParams.get("slug");

  let coachId: number | null = null;
  if (slug) {
    const [coach] = await getDb().select().from(usersTable).where(eq(usersTable.slug, slug));
    if (coach) coachId = coach.id;
  } else {
    coachId = parseInt(rawCoachId ?? "1", 10);
  }

  if (!coachId) return NextResponse.json([]);

  const plans = await getDb().select()
    .from(coachPlansTable)
    .where(and(eq(coachPlansTable.coachId, coachId), eq(coachPlansTable.isActive, true)));
  return NextResponse.json(plans);
}
