import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { carFiles, cars } from "@/db/schema";
import { canManageCars, cleanText, forbidden, getAuthenticatedUser, getOrCreateAccount, serverError, unauthorized } from "../../_lib";

export const dynamic = "force-dynamic";

const fileCategories = ["photos", "title", "registration", "bill_of_sale", "ownership_history", "identity", "drivetrain", "restoration_history", "restoration_invoice", "condition", "photo_manifest", "provenance", "application", "video"];

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id } = await context.params;
    const [car] = await getDb().select().from(cars).where(eq(cars.id, id)).limit(1);
    if (!car) return Response.json({ error: "Car file not found." }, { status: 404 });
    const files = await getDb().select().from(carFiles).where(eq(carFiles.carId, id)).orderBy(desc(carFiles.createdAt));
    return Response.json({ car, files });
  } catch (error) {
    return serverError(error, "The car file could not be loaded.");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    const visibility = ["private", "members", "public"].includes(String(body.visibility)) ? String(body.visibility) : "private";
    const status = ["intake", "review", "ready", "released"].includes(String(body.status)) ? String(body.status) : "intake";
    const received = Array.isArray(body.received)
      ? body.received
          .map((item) => cleanText(item, 24))
          .filter((item) => fileCategories.includes(item))
      : [];
    const updates = {
      year: cleanText(body.year, 12),
      make: cleanText(body.make, 80),
      model: cleanText(body.model, 120),
      sellerName: cleanText(body.owner, 120),
      sellerPhone: cleanText(body.phone, 50),
      expectedPrice: cleanText(body.price, 80),
      sellerEmail: cleanText(body.email, 160),
      location: cleanText(body.location, 180),
      vin: cleanText(body.vin, 120),
      notes: cleanText(body.notes, 8000),
      exteriorColor: cleanText(body.exteriorColor, 120),
      interiorColor: cleanText(body.interiorColor, 120),
      mileage: cleanText(body.mileage, 80),
      bodyStyle: cleanText(body.bodyStyle, 120),
      engine: cleanText(body.engine, 160),
      transmission: cleanText(body.transmission, 160),
      drivetrain: cleanText(body.drivetrain, 120),
      registryId: cleanText(body.registryId, 120),
      shortDescription: cleanText(body.shortDescription, 449),
      overview: cleanText(body.overview, 50000),
      highlights: cleanText(body.highlights, 8000),
      conditionSummary: cleanText(body.conditionSummary, 8000),
      provenance: cleanText(body.provenance, 12000),
      restorationSummary: cleanText(body.restorationSummary, 12000),
      receivedCategories: Array.from(new Set(received)).join(","),
      visibility,
      status,
      updatedAt: Date.now(),
    };
    const saved = await getDb().update(cars).set(updates).where(eq(cars.id, id)).returning();
    if (!saved.length) return Response.json({ error: "Car file not found." }, { status: 404 });
    return Response.json({ car: saved[0] });
  } catch (error) {
    return serverError(error, "The car file could not be saved. Your entries remain on screen.");
  }
}
