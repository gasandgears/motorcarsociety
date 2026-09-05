import { desc } from "drizzle-orm";

import { getDb } from "@/db";
import { mailingContacts } from "@/db/schema";
import { cleanText, forbidden, getAuthenticatedUser, getOrCreateAccount, isAdmin, serverError, unauthorized } from "../../_lib";

export const dynamic = "force-dynamic";
const permissions = ["needs_review", "existing_client", "confirmed_opt_in", "unsubscribed"];

export async function GET(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!isAdmin(await getOrCreateAccount(request))) return forbidden();
  try {
    const contacts = await getDb().select().from(mailingContacts).orderBy(desc(mailingContacts.updatedAt)).limit(5000);
    return Response.json({ contacts });
  } catch (error) { return serverError(error, "The contact list is temporarily unavailable."); }
}

export async function POST(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!isAdmin(await getOrCreateAccount(request))) return forbidden();
  try {
    const body = await request.json() as { contacts?: unknown[]; permission?: unknown; source?: unknown };
    const permission = permissions.includes(String(body.permission)) ? String(body.permission) : "needs_review";
    const source = cleanText(body.source, 120) || "client list";
    const input = Array.isArray(body.contacts) ? body.contacts.slice(0, 5000) : [];
    const now = Date.now();
    const seen = new Set<string>();
    const valid = input.flatMap((raw) => {
      const row = raw as Record<string, unknown>;
      const email = cleanText(row.email, 180).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || seen.has(email)) return [];
      seen.add(email);
      return [{ id: crypto.randomUUID(), email, displayName: cleanText(row.name, 160), phone: cleanText(row.phone, 50), source, permission, inviteStatus: "not_sent", unsubscribedAt: permission === "unsubscribed" ? now : null, createdAt: now, updatedAt: now }];
    });
    const db = getDb();
    for (const contact of valid) {
      await db.insert(mailingContacts).values(contact).onConflictDoUpdate({ target: mailingContacts.email, set: { displayName: contact.displayName, phone: contact.phone, source, permission, unsubscribedAt: contact.unsubscribedAt, updatedAt: now } });
    }
    return Response.json({ imported: valid.length, skipped: input.length - valid.length });
  } catch (error) { return serverError(error, "The contact list could not be imported."); }
}
