import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "trainova-secret-key-12345";

export interface Session {
  userId: number;
  role: string;
  clientId?: number;
}

function sign(value: string): string {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(value);
  return `${value}.${hmac.digest("hex")}`;
}

function verify(signed: string): string | null {
  const dotIndex = signed.lastIndexOf(".");
  if (dotIndex === -1) return null;
  const value = signed.slice(0, dotIndex);
  const sig = signed.slice(dotIndex + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  if (sig.length !== expected.length) return null;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? value : null;
  } catch {
    return null;
  }
}

export function getSession(request: NextRequest): Session | null {
  const cookie = request.cookies.get("session");
  if (!cookie?.value) return null;
  const value = verify(cookie.value);
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

export function saveSession(response: NextResponse, session: Session): void {
  const signed = sign(JSON.stringify(session));
  response.cookies.set("session", signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSession(response: NextResponse): void {
  response.cookies.set("session", "", { maxAge: 0, path: "/" });
}
