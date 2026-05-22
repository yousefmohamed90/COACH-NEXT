import { NextRequest, NextResponse } from "next/server";
import { getDb, usersTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { coachId, slug, password, bio, welcomeMessage } = body;

  if (!coachId || !slug || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [existingSlug] = await getDb().select().from(usersTable).where(eq(usersTable.slug, slug));
  if (existingSlug) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
  }

  const passwordHash = hashPassword(password);
  const update: Record<string, unknown> = { slug, passwordHash };
  if (bio !== undefined) update.bio = bio;
  if (welcomeMessage !== undefined) update.welcomeMessage = welcomeMessage;

  const [updated] = await getDb().update(usersTable)
    .set(update)
    .where(eq(usersTable.id, coachId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
