import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { wantedVehicles } from "@/db/schema";
import { cleanText, getAuthenticatedUser, getOrCreateAccount, serverError, unauthorized } from "../_lib";

export const dynamic = "force-dynamic";

function cleanAmount(value: unknown) { return cleanText(value, 24).replace(/[$,\s]/g, "").replace(/[^0-9.]/g, ""); }
function values(body: Record<string, unknown>) {
  const acquisitionLow = cleanAmount(body.acquisitionLow);
  const acquisitionHigh = cleanAmount(body.acquisitionHigh);
  if (acquisitionLow && acquisitionHigh && Number(acquisitionLow) > Number(acquisitionHigh)) throw new Error("RANGE");
  return { year: cleanText(body.year, 30), make: cleanText(body.make, 80), model: cleanText(body.model, 120), variant: cleanText(body.variant, 120), acquisitionLow, acquisitionHigh, notes: cleanText(body.notes, 3000), status: body.status === "paused" ? "paused" : "active", updatedAt: Date.now() };
}

export async function GET(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  try { const account = await getOrCreateAccount(request); if (!account) return unauthorized(); return Response.json({ items: await getDb().select().from(wantedVehicles).where(eq(wantedVehicles.userId, account.userId)).orderBy(desc(wantedVehicles.updatedAt)) }); }
  catch (error) { return serverError(error, "Your Wanted List is temporarily unavailable."); }
}

export async function POST(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  try {
    const account = await getOrCreateAccount(request); if (!account) return unauthorized();
    const body = await request.json() as Record<string, unknown>; const cleaned = values(body);
    if (!cleaned.make && !cleaned.model) return Response.json({ error: "Add at least a make or model." }, { status: 400 });
    const item = { id: crypto.randomUUID(), userId: account.userId, ...cleaned, createdAt: Date.now() };
    await getDb().insert(wantedVehicles).values(item); return Response.json({ item }, { status: 201 });
  } catch (error) { if (error instanceof Error && error.message === "RANGE") return Response.json({ error: "The high range must be greater than the low range." }, { status: 400 }); return serverError(error, "The wanted vehicle could not be saved."); }
}

export async function PATCH(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  try {
    const account = await getOrCreateAccount(request); if (!account) return unauthorized();
    const body = await request.json() as Record<string, unknown>; const id = cleanText(body.id, 80); const cleaned = values(body);
    const [item] = await getDb().update(wantedVehicles).set(cleaned).where(and(eq(wantedVehicles.id, id), eq(wantedVehicles.userId, account.userId))).returning();
    if (!item) return Response.json({ error: "Wanted vehicle not found." }, { status: 404 }); return Response.json({ item });
  } catch (error) { if (error instanceof Error && error.message === "RANGE") return Response.json({ error: "The high range must be greater than the low range." }, { status: 400 }); return serverError(error, "The wanted vehicle could not be updated."); }
}

export async function DELETE(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  try { const account = await getOrCreateAccount(request); if (!account) return unauthorized(); const id = new URL(request.url).searchParams.get("id") || ""; const deleted = await getDb().delete(wantedVehicles).where(and(eq(wantedVehicles.id, id), eq(wantedVehicles.userId, account.userId))).returning(); if (!deleted.length) return Response.json({ error: "Wanted vehicle not found." }, { status: 404 }); return Response.json({ deleted: true }); }
  catch (error) { return serverError(error, "The wanted vehicle could not be removed."); }
}
