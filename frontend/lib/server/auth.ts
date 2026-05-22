import { createHash, randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { getSession, type Session } from "./session";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(password + salt).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const computed = createHash("sha256").update(password + salt).digest("hex");
  return computed === hash;
}

export function requireAuth(request: NextRequest): Session | null {
  const session = getSession(request);
  if (!session?.userId) return null;
  return session;
}

export function requireRole(request: NextRequest, role: string): Session | null {
  const session = requireAuth(request);
  if (!session || session.role !== role) return null;
  return session;
}
