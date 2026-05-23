import { NextResponse } from "next/server";
import { getPool } from "@trainova/database";

export async function GET() {
  try {
    const pool = getPool();
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz");
    return NextResponse.json({ success: true, message: "trial_ends_at column added" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}