import { asc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { accounts } from "@/db/schema";
import { cleanText, forbidden, getAuthenticatedUser, getOrCreateAccount, isAdmin, serverError, unauthorized } from "../../_lib";

export const dynamic = "force-dynamic";

const roles = ["applicant", "member", "barnaby", "admin"];
const statuses = ["pending", "approved", "denied"];
const tiers = ["none", "standard", "priority", "private", "staff", "leadership"];

export async function GET(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!isAdmin(await getOrCreateAccount(request))) return forbidden();
  try {
    const members = await getDb().select().from(accounts).orderBy(asc(accounts.createdAt));
    return Response.json({ members });
  } catch (error) {
    return serverError(error, "Member accounts are temporarily unavailable.");
  }
}

export async function PATCH(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!isAdmin(await getOrCreateAccount(request))) return forbidden();
  try {
    const body = await request.json() as Record<string, unknown>;
    const userId = cleanText(body.userId, 180);
    const role = cleanText(body.role, 24);
    const status = cleanText(body.status, 24);
    const tier = cleanText(body.tier, 24);
    if (!userId || !roles.includes(role) || !statuses.includes(status) || !tiers.includes(tier)) {
      return Response.json({ error: "Choose a valid role, tier, and account status." }, { status: 400 });
    }
    const db = getDb();
    const [target] = await db.select().from(accounts).where(eq(accounts.userId, userId)).limit(1);
    if (!target) return Response.json({ error: "Member account not found." }, { status: 404 });
    if (target.email === "deank@kirklanddigital.com" && (role !== "admin" || status !== "approved")) {
      return Response.json({ error: "The primary administrator cannot be removed." }, { status: 400 });
    }
    const now = Date.now();
    if (role === "barnaby") {
      await db.update(accounts).set({ role: "member", tier: "standard", updatedAt: now }).where(eq(accounts.role, "barnaby"));
    }
    const [saved] = await db.update(accounts).set({ role, status, tier, updatedAt: now }).where(eq(accounts.userId, userId)).returning();
    return Response.json({ member: saved });
  } catch (error) {
    return serverError(error, "The member account could not be updated.");
  }
}
