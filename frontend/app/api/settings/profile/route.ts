import { NextRequest, NextResponse } from "next/server";
import { db, usersTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function PATCH(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { customDomain, polarApiKey, slug, bio, logoUrl, welcomeMessage, brandColor, socialLinks } = body;
  const update: Record<string, unknown> = {};

  if (customDomain !== undefined) update.customDomain = customDomain || null;
  if (polarApiKey !== undefined) update.polarApiKey = polarApiKey || null;
  if (slug !== undefined) {
    const [existingSlug] = await db.select().from(usersTable).where(eq(usersTable.slug, slug));
    if (existingSlug && existingSlug.id !== session.userId) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }
    update.slug = slug || null;
  }
  if (bio !== undefined) update.bio = bio || null;
  if (logoUrl !== undefined) update.logoUrl = logoUrl || null;
  if (welcomeMessage !== undefined) update.welcomeMessage = welcomeMessage || null;
  if (brandColor !== undefined) update.brandColor = brandColor || null;
  if (socialLinks !== undefined) update.socialLinks = socialLinks ? JSON.stringify(socialLinks) : null;

  const [updated] = await db.update(usersTable).set(update).where(eq(usersTable.id, session.userId)).returning();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { polarApiKey: _hidden, passwordHash: _pw, ...safe } = updated;
  return NextResponse.json({ ...safe, hasPolarKey: !!_hidden });
}
