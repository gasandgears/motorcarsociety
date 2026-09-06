import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { vehicleSubmissions } from "@/db/schema";
import { cleanText, forbidden, getAuthenticatedUser, getOrCreateAccount, isAdmin, serverError, unauthorized } from "../../_lib";

export const dynamic = "force-dynamic";
const statuses = ["new", "contacted", "accepted", "declined"];

export async function GET(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!isAdmin(await getOrCreateAccount(request))) return forbidden();
  try { return Response.json({ submissions: await getDb().select().from(vehicleSubmissions).orderBy(desc(vehicleSubmissions.createdAt)).limit(500) }); }
  catch (error) { return serverError(error, "Vehicle submissions are temporarily unavailable."); }
}

export async function PATCH(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!isAdmin(await getOrCreateAccount(request))) return forbidden();
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = cleanText(body.id, 80); const status = cleanText(body.status, 30);
    if (!id || !statuses.includes(status)) return Response.json({ error: "Choose a valid submission status." }, { status: 400 });
    const [saved] = await getDb().update(vehicleSubmissions).set({ status, updatedAt: Date.now() }).where(eq(vehicleSubmissions.id, id)).returning();
    if (!saved) return Response.json({ error: "Vehicle submission not found." }, { status: 404 });
    return Response.json({ submission: saved });
  } catch (error) { return serverError(error, "The submission could not be updated."); }
}
