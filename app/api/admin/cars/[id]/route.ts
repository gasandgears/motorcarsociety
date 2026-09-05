import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { cars } from "@/db/schema";
import { cleanText, forbidden, getAuthenticatedUser, getOrCreateAccount, isAdmin, serverError, unauthorized } from "../../../_lib";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!isAdmin(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    const visibility = cleanText(body.visibility, 24);
    const status = cleanText(body.status, 24);
    if (!["private", "members", "public"].includes(visibility) || !["intake", "review", "ready", "released"].includes(status)) {
      return Response.json({ error: "Choose a valid release status and audience." }, { status: 400 });
    }
    const [saved] = await getDb().update(cars).set({ visibility, status, updatedAt: Date.now() }).where(eq(cars.id, id)).returning();
    if (!saved) return Response.json({ error: "Car file not found." }, { status: 404 });
    return Response.json({ car: saved });
  } catch (error) {
    return serverError(error, "The Registry release could not be updated.");
  }
}
