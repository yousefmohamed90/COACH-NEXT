import { NextRequest, NextResponse } from "next/server";
import { getDb, subscriptionRequestsTable, usersTable } from "@trainova/database";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { name, email, phone, countryCode, package: pkg, paymentMethod, notes, coachId, slug } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!email || typeof email !== "string" || !email.includes("@"))
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  if (!phone || typeof phone !== "string")
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  if (!pkg || typeof pkg !== "string")
    return NextResponse.json({ error: "Package is required" }, { status: 400 });
  if (!paymentMethod || typeof paymentMethod !== "string")
    return NextResponse.json({ error: "Payment method is required" }, { status: 400 });

  let resolvedCoachId: number;
  if (slug) {
    const [coach] = await getDb().select().from(usersTable).where(eq(usersTable.slug, String(slug)));
    if (!coach) return NextResponse.json({ error: "Coach not found" }, { status: 400 });
    resolvedCoachId = coach.id;
  } else {
    resolvedCoachId = typeof coachId === "number" ? coachId : 1;
  }

  const [request_] = await getDb().insert(subscriptionRequestsTable).values({
    name: name.trim(), email: email.trim(), phone: phone.trim(),
    countryCode: typeof countryCode === "string" ? countryCode : "+966",
    package: pkg, paymentMethod, notes: notes ?? null,
    coachId: resolvedCoachId, status: "pending",
  }).returning();

  return NextResponse.json({ success: true, id: request_.id }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const requests = await getDb().select()
    .from(subscriptionRequestsTable)
    .where(eq(subscriptionRequestsTable.coachId, session.userId))
    .orderBy(desc(subscriptionRequestsTable.createdAt));

  return NextResponse.json(requests);
}
