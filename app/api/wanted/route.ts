import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { wantedProfiles } from "@/db/schema";
import { cleanText, getAuthenticatedUser, getOrCreateAccount, serverError, unauthorized } from "../_lib";

export const dynamic = "force-dynamic";

function cleanAmount(value: unknown) {
  return cleanText(value, 24).replace(/[$,\s]/g, "").replace(/[^0-9.]/g, "");
}

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
    const acquisitionLow = cleanAmount(body.acquisitionLow);
    const acquisitionHigh = cleanAmount(body.acquisitionHigh);
    if (acquisitionLow && acquisitionHigh && Number(acquisitionLow) > Number(acquisitionHigh)) {
      return Response.json({ error: "The high end of your range must be greater than the low end." }, { status: 400 });
    }
    const era = ["prewar", "postwar", "seventies", "modern", "any"].includes(String(body.era)) ? String(body.era) : "postwar";
    const primaryInterest = ["important", "competition", "preservation", "concours", "any"].includes(String(body.primaryInterest)) ? String(body.primaryInterest) : "important";
    const now = Date.now();
    const values = {
      id: crypto.randomUUID(),
      userId: account.userId,
      marques: marques.join("|"),
      specificCar: cleanText(body.specificCar, 240),
      valueRange: "custom",
      acquisitionLow,
      acquisitionHigh,
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
        valueRange: "custom",
        acquisitionLow,
        acquisitionHigh,
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
