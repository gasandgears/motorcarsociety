import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { cars, dossierRequests } from "@/db/schema";
import { getAuthenticatedUser, getOrCreateAccount, serverError, unauthorized } from "../_lib";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();
  try {
    const account = await getOrCreateAccount(request);
    if (!account || account.status !== "approved") return Response.json({ error: "Approved membership is required." }, { status: 403 });
    const body = await request.json() as { carId?: unknown };
    const carId = typeof body.carId === "string" ? body.carId : "";
    const [car] = await getDb().select().from(cars).where(eq(cars.id, carId)).limit(1);
    const staff = account.role === "admin" || account.role === "barnaby";
    const visible = car && (staff || (car.status === "released" && (car.visibility === "public" || (account.role === "member" && car.visibility === "members"))));
    if (!visible) return Response.json({ error: "This vehicle is not available to your account." }, { status: 403 });
    const now = Date.now();
    await getDb().insert(dossierRequests).values({ id: crypto.randomUUID(), carId, requesterUserId: account.userId, requesterEmail: account.email, status: "new", createdAt: now, updatedAt: now }).onConflictDoUpdate({
      target: [dossierRequests.carId, dossierRequests.requesterUserId],
      set: { status: "new", requesterEmail: account.email, updatedAt: now },
    });
    const [saved] = await getDb().select().from(dossierRequests).where(and(eq(dossierRequests.carId, carId), eq(dossierRequests.requesterUserId, account.userId))).limit(1);
    return Response.json({ request: saved }, { status: 201 });
  } catch (error) {
    return serverError(error, "Your dossier request could not be saved.");
  }
}
