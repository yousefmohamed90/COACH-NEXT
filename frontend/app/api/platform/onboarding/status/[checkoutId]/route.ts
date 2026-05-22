import { NextRequest, NextResponse } from "next/server";
import { getDb, platformPurchasesTable } from "@trainova/database";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> }
) {
  const { checkoutId } = await params;

  const [purchase] = await getDb().select()
    .from(platformPurchasesTable)
    .where(eq(platformPurchasesTable.polarCheckoutId, checkoutId));

  if (!purchase) {
    return NextResponse.json({ error: "Checkout not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: purchase.status,
    coachId: purchase.coachId,
  });
}
