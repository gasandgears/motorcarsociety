import { desc } from "drizzle-orm";

import { getDb } from "@/db";
import { cars } from "@/db/schema";
import { cleanText, getAuthenticatedUser, serverError, unauthorized } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  try {
    const results = await getDb().select().from(cars).orderBy(desc(cars.updatedAt)).limit(50);
    return Response.json({ cars: results });
  } catch (error) {
    return serverError(error, "Saved car files are temporarily unavailable.");
  }
}

export async function POST(request: Request) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();

  try {
    const body = await request.json() as Record<string, unknown>;
    const year = cleanText(body.year, 12);
    const make = cleanText(body.make, 80);
    const model = cleanText(body.model, 120);
    const sellerName = cleanText(body.owner, 120);
    const sellerPhone = cleanText(body.phone, 50);
    if (![year, make, model, sellerName, sellerPhone].some(Boolean)) {
      return Response.json({ error: "Add a vehicle or seller detail before creating the file." }, { status: 400 });
    }

    const now = Date.now();
    const car = {
      id: crypto.randomUUID(),
      createdBy: user.id,
      createdByEmail: user.email,
      year,
      make,
      model,
      sellerName,
      sellerPhone,
      expectedPrice: cleanText(body.price, 80),
      sellerEmail: "",
      location: "",
      vin: "",
      notes: "",
      visibility: "private",
      status: "intake",
      createdAt: now,
      updatedAt: now,
    };

    await getDb().insert(cars).values(car);
    return Response.json({ car }, { status: 201 });
  } catch (error) {
    return serverError(error, "The car file could not be created. Your entries remain on screen.");
  }
}
