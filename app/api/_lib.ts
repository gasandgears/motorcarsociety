import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";

import { getDb } from "@/db";
import { accounts, cars } from "@/db/schema";

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
  return Response.json({ error: "You do not have access to this area." }, { status: 403 });
}

export type Account = typeof accounts.$inferSelect;

export async function getOrCreateAccount(request: Request): Promise<Account | null> {
  const user = getAuthenticatedUser(request);
  if (!user) return null;
  const email = user.email.trim().toLowerCase();
  const now = Date.now();
  const bootstrap = email === "deank@kirklanddigital.com" || email === "bbforcars@gmail.com"
    ? { role: "admin", tier: "leadership", status: "approved" }
    : email === "deankirkland@me.com"
      ? { role: "member", tier: "standard", status: "approved" }
      : { role: "applicant", tier: "none", status: "pending" };
  const db = getDb();
  await db.insert(accounts).values({
    userId: user.id,
    email,
    displayName: email.split("@")[0],
    phone: "",
    location: "",
    collectionNotes: "",
    ...bootstrap,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing({ target: accounts.userId });
  if (bootstrap.role !== "applicant") {
    await db.update(accounts).set({ ...bootstrap, email, updatedAt: now }).where(eq(accounts.userId, user.id));
  }
  const [account] = await db.select().from(accounts).where(eq(accounts.userId, user.id)).limit(1);
  return account || null;
}

export function isBarnaby(account: Account | null) {
  return account?.role === "barnaby" && account.status === "approved";
}

export function isAdmin(account: Account | null) {
  return account?.role === "admin" && account.status === "approved";
}

export function canManageCars(account: Account | null) {
  return isBarnaby(account) || isAdmin(account);
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
