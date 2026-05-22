import { NextRequest, NextResponse } from "next/server";
import { getDb, usersTable, coachPlansTable } from "@trainova/database";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { planId, coachId: rawCoachId, successUrl, customerEmail } = body;
  const coachId = parseInt(String(rawCoachId ?? "1"), 10);

  const [coach] = await getDb().select().from(usersTable).where(eq(usersTable.id, coachId));
  if (!coach?.polarApiKey) {
    return NextResponse.json({ error: "Coach has not configured Polar payments" }, { status: 400 });
  }

  const [plan] = await getDb().select().from(coachPlansTable)
    .where(and(eq(coachPlansTable.id, parseInt(planId, 10)), eq(coachPlansTable.coachId, coachId)));
  if (!plan?.polarProductId) {
    return NextResponse.json({ error: "Plan is not linked to a Polar product" }, { status: 400 });
  }

  try {
    const origin = request.headers.get("origin") || "";
    const polarRes = await fetch("https://api.polar.sh/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${coach.polarApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: plan.polarProductId,
        success_url: successUrl ?? `${origin}/subscribe?success=1`,
        customer_email: customerEmail ?? undefined,
      }),
    });
    if (!polarRes.ok) {
      const err = await polarRes.text();
      return NextResponse.json({ error: "Polar API error", details: err }, { status: 502 });
    }
    const checkout = await polarRes.json() as { url: string };
    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
