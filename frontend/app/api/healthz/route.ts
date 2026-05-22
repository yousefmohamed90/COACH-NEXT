import { NextResponse } from "next/server";
import { HealthCheckResponse } from "@trainova/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = HealthCheckResponse.parse({ status: "ok" });
  return NextResponse.json(data);
}
