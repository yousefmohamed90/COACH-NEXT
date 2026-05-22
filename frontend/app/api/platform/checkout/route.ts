import { NextRequest, NextResponse } from "next/server";
import { db, usersTable, platformPurchasesTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { email, name, successUrl } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const platformApiKey = process.env.POLAR_PLATFORM_API_KEY;
  const platformProductId = process.env.POLAR_PLATFORM_PRODUCT_ID;

  if (!platformApiKey || !platformProductId) {
    return NextResponse.json({ error: "Platform payment not configured" }, { status: 500 });
  }

  try {
    const origin = request.headers.get("origin") || "";
    const polarRes = await fetch("https://api.polar.sh/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${platformApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: platformProductId,
        success_url: successUrl ?? `${origin}/onboarding?checkout_id={CHECKOUT_ID}`,
        customer_email: email,
        customer_name: name ?? undefined,
        metadata: { email, name: name ?? "" },
      }),
    });

    if (!polarRes.ok) {
      const err = await polarRes.text();
      return NextResponse.json({ error: "Polar API error", details: err }, { status: 502 });
    }

    const checkout = await polarRes.json() as { url: string; id: string };

    await db.insert(platformPurchasesTable).values({
      coachId: 0,
      polarCheckoutId: checkout.id,
      amount: 200,
      currency: "USD",
      status: "pending",
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
