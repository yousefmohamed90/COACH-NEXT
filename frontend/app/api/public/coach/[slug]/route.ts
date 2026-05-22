import { NextRequest, NextResponse } from "next/server";
import { getDb, usersTable } from "@trainova/database";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const [coach] = await getDb().select().from(usersTable).where(eq(usersTable.slug, slug));
  if (!coach) return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  const { passwordHash: _pw, polarApiKey: _key, ...safeCoach } = coach;
  return NextResponse.json(safeCoach);
}
