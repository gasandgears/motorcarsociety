import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { accounts, mailingContacts } from "@/db/schema";
import { cleanText, getAuthenticatedUser, getOrCreateAccount, serverError, unauthorized } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const account = await getOrCreateAccount(request);
    return Response.json({ account });
  } catch (error) {
    return serverError(error, "Your member account is temporarily unavailable.");
  }
}

export async function PATCH(request: Request) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();
  try {
    const account = await getOrCreateAccount(request);
    if (!account) return unauthorized();
    const body = await request.json() as Record<string, unknown>;
    const now = Date.now();
    const updates: Partial<typeof accounts.$inferInsert> = { updatedAt: now };
    if ("displayName" in body) updates.displayName = cleanText(body.displayName, 120);
    if ("phone" in body) updates.phone = cleanText(body.phone, 50);
    if ("location" in body) updates.location = cleanText(body.location, 180);
    if ("collectionNotes" in body) updates.collectionNotes = cleanText(body.collectionNotes, 4000);
    const database = getDb();
    const [saved] = await database.update(accounts).set(updates).where(eq(accounts.userId, account.userId)).returning();
    if (body.newsletterOptIn === true) await database.insert(mailingContacts).values({ id: crypto.randomUUID(), email: account.email, displayName: saved?.displayName || account.displayName, phone: saved?.phone || account.phone, source: "free member signup", permission: "confirmed_opt_in", inviteStatus: "not_sent", createdAt: now, updatedAt: now }).onConflictDoUpdate({ target: mailingContacts.email, set: { displayName: saved?.displayName || account.displayName, phone: saved?.phone || account.phone, source: "free member signup", permission: "confirmed_opt_in", unsubscribedAt: null, updatedAt: now } });
    return Response.json({ account: saved });
  } catch (error) {
    return serverError(error, "Your application could not be saved.");
  }
}
