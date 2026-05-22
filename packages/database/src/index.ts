import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let _pool: ReturnType<typeof createPool> | null = null;
let _db: ReturnType<typeof createDb> | null = null;

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

function createDb() {
  _pool = createPool();
  return drizzle(_pool, { schema });
}

export function getPool() {
  if (!_pool) _pool = createPool();
  return _pool;
}

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export * from "./schema";
