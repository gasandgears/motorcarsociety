import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { wantedProfiles } from "@/db/schema";
import { cleanText, getAuthenticatedUser, getOrCreateAccount, serverError, unauthorized } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  try {
    const account = await getOrCreateAccount(request);
    if (!account) return unauthorized();
    const [profile] = await getDb().select().from(wantedProfiles).where(eq(wantedProfiles.userId, account.userId)).limit(1);
    return Response.json({ profile: profile || null });
  } catch (error) {
    return serverError(error, "Your Wanted List is temporarily unavailable.");
  }
}

export async function PUT(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  try {
    const account = await getOrCreateAccount(request);
    if (!account) return unauthorized();
    const body = await request.json() as Record<string, unknown>;
    const marques = Array.isArray(body.marques)
      ? Array.from(new Set(body.marques.map((item) => cleanText(item, 80)).filter(Boolean))).slice(0, 30)
      : [];
    const valueRange = ["250-500", "500-1500", "1500-5000", "5000+"].includes(String(body.valueRange)) ? String(body.valueRange) : "500-1500";
    const era = ["prewar", "postwar", "seventies", "modern", "any"].includes(String(body.era)) ? String(body.era) : "postwar";
    const primaryInterest = ["important", "competition", "preservation", "concours", "any"].includes(String(body.primaryInterest)) ? String(body.primaryInterest) : "important";
    const now = Date.now();
    const values = {
      id: crypto.randomUUID(),
      userId: account.userId,
      marques: marques.join("|"),
      specificCar: cleanText(body.specificCar, 240),
      valueRange,
      era,
      primaryInterest,
      createdAt: now,
      updatedAt: now,
    };
    await getDb().insert(wantedProfiles).values(values).onConflictDoUpdate({
      target: wantedProfiles.userId,
      set: {
        marques: values.marques,
        specificCar: values.specificCar,
        valueRange,
        era,
        primaryInterest,
        updatedAt: now,
      },
    });
    const [profile] = await getDb().select().from(wantedProfiles).where(eq(wantedProfiles.userId, account.userId)).limit(1);
    return Response.json({ profile });
  } catch (error) {
    return serverError(error, "Your Wanted List could not be saved.");
  }
}
