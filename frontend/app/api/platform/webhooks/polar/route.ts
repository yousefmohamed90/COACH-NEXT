import { NextRequest, NextResponse } from "next/server";
import { getDb, usersTable, platformPurchasesTable } from "@trainova/database";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-polar-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(rawBody);
  const expectedSignature = hmac.digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { type, data } = JSON.parse(rawBody);

  if (type === "checkout.completed") {
    const { checkout_id, customer_email, customer_name, metadata } = data;

    const [purchase] = await getDb().select()
      .from(platformPurchasesTable)
      .where(eq(platformPurchasesTable.polarCheckoutId, checkout_id));

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    const [existingUser] = await getDb().select()
      .from(usersTable)
      .where(eq(usersTable.email, customer_email));

    let userId: number;

    if (existingUser) {
      userId = existingUser.id;
      await getDb().update(usersTable)
        .set({ subscriptionStatus: "active", polarPurchaseId: checkout_id })
        .where(eq(usersTable.id, userId));
    } else {
      const tempPassword = crypto.randomBytes(16).toString("hex");
      const passwordHash = crypto.createHash("sha256").update(tempPassword).digest("hex");

      const [newUser] = await getDb().insert(usersTable).values({
        email: customer_email,
        passwordHash,
        name: customer_name || metadata?.name || "Coach",
        role: "coach",
        subscriptionStatus: "active",
        polarPurchaseId: checkout_id,
      }).returning();

      userId = newUser.id;
    }

    await getDb().update(platformPurchasesTable)
      .set({ coachId: userId, status: "completed" })
      .where(eq(platformPurchasesTable.id, purchase.id));

    return NextResponse.json({ success: true, userId });
  }

  return NextResponse.json({ received: true });
}
