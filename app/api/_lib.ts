import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";

import { getDb } from "@/db";
import { cars } from "@/db/schema";

export type AuthenticatedUser = {
  id: string;
  email: string;
};

export function getAuthenticatedUser(request: Request): AuthenticatedUser | null {
  const id = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email");
  if (!id || !email) return null;
  return { id, email };
}

export function unauthorized() {
  return Response.json({ error: "Please sign in again." }, { status: 401 });
}

export function forbidden() {
  return Response.json({ error: "Barnaby’s Desk is restricted to Barnaby’s account." }, { status: 403 });
}

export function isBarnaby(user: AuthenticatedUser | null) {
  return user?.email.trim().toLowerCase() === "deankirkland@me.com";
}

export function serverError(error: unknown, message = "The request could not be completed.") {
  console.error(error);
  return Response.json({ error: message }, { status: 500 });
}

export async function carExists(id: string) {
  const [car] = await getDb().select({ id: cars.id }).from(cars).where(eq(cars.id, id)).limit(1);
  return Boolean(car);
}

export function getBucket() {
  const bucket = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
  if (!bucket) throw new Error("Cloudflare R2 binding `BUCKET` is unavailable.");
  return bucket;
}

export function cleanText(value: unknown, maxLength = 4000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function safeFilename(value: string) {
  const decoded = (() => {
    try { return decodeURIComponent(value); } catch { return value; }
  })();
  return decoded.replace(/[\u0000-\u001f\u007f]/g, "").replace(/[\\/]/g, "-").slice(0, 180) || "upload";
}
