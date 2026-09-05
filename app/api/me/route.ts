import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { accounts } from "@/db/schema";
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
    const updates = {
      displayName: cleanText(body.displayName, 120),
      phone: cleanText(body.phone, 50),
      location: cleanText(body.location, 180),
      collectionNotes: cleanText(body.collectionNotes, 4000),
      updatedAt: Date.now(),
    };
    const [saved] = await getDb().update(accounts).set(updates).where(eq(accounts.userId, account.userId)).returning();
    return Response.json({ account: saved });
  } catch (error) {
    return serverError(error, "Your application could not be saved.");
  }
}
