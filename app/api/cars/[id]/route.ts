import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { carFiles, cars } from "@/db/schema";
import { cleanText, getAuthenticatedUser, serverError, unauthorized } from "../../_lib";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
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
  try {
    const { id } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    const visibility = ["private", "members", "public"].includes(String(body.visibility)) ? String(body.visibility) : "private";
    const status = ["intake", "review", "ready", "released"].includes(String(body.status)) ? String(body.status) : "intake";
    const received = Array.isArray(body.received)
      ? body.received
          .map((item) => cleanText(item, 24))
          .filter((item) => ["photos", "title", "numbers", "history", "video"].includes(item))
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
