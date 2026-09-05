import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { cars, dossierRequests } from "@/db/schema";
import { cleanText, forbidden, getOrCreateAccount, isAdmin, serverError, unauthorized } from "../../_lib";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const account = await getOrCreateAccount(request);
  if (!account) return unauthorized();
  if (!isAdmin(account)) return forbidden();
  try {
    const requests = await getDb().select({
      id: dossierRequests.id,
      carId: dossierRequests.carId,
      requesterEmail: dossierRequests.requesterEmail,
      status: dossierRequests.status,
      createdAt: dossierRequests.createdAt,
      updatedAt: dossierRequests.updatedAt,
      year: cars.year,
      make: cars.make,
      model: cars.model,
    }).from(dossierRequests).innerJoin(cars, eq(dossierRequests.carId, cars.id)).orderBy(desc(dossierRequests.updatedAt)).limit(100);
    return Response.json({ requests });
  } catch (error) {
    return serverError(error, "Dossier requests could not be loaded.");
  }
}

export async function PATCH(request: Request) {
  const account = await getOrCreateAccount(request);
  if (!account) return unauthorized();
  if (!isAdmin(account)) return forbidden();
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = cleanText(body.id, 80);
    const status = ["new", "contacted", "closed"].includes(String(body.status)) ? String(body.status) : "new";
    const saved = await getDb().update(dossierRequests).set({ status, updatedAt: Date.now() }).where(eq(dossierRequests.id, id)).returning();
    if (!saved.length) return Response.json({ error: "Request not found." }, { status: 404 });
    return Response.json({ request: saved[0] });
  } catch (error) {
    return serverError(error, "The dossier request could not be updated.");
  }
}
