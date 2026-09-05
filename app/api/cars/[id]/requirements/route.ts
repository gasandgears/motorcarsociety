import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { carRequirements } from "@/db/schema";
import { canManageCars, cleanText, forbidden, getAuthenticatedUser, getOrCreateAccount, serverError, unauthorized } from "../../../_lib";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id } = await context.params;
    const entries = await getDb().select().from(carRequirements).where(eq(carRequirements.carId, id)).orderBy(asc(carRequirements.requirementKey));
    return Response.json({ entries });
  } catch (error) { return serverError(error, "Registry checklist entries could not be loaded."); }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id: carId } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    const requirementKey = cleanText(body.requirementKey, 80);
    const entryText = cleanText(body.entryText, 20000);
    if (!requirementKey) return Response.json({ error: "Choose a checklist item." }, { status: 400 });
    const existing = await getDb().select().from(carRequirements).where(and(eq(carRequirements.carId, carId), eq(carRequirements.requirementKey, requirementKey))).limit(1);
    const values = { entryText, completionMethod: "manual", updatedAt: Date.now() };
    const [entry] = existing.length
      ? await getDb().update(carRequirements).set(values).where(eq(carRequirements.id, existing[0].id)).returning()
      : await getDb().insert(carRequirements).values({ id: crypto.randomUUID(), carId, requirementKey, sourceFileId: null, ...values }).returning();
    return Response.json({ entry });
  } catch (error) { return serverError(error, "The checklist entry could not be saved."); }
}
