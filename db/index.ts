import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  client ??= postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });
  return drizzle(client, { schema });
}
