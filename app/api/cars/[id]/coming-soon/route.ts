import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { cars, carFiles, comingSoonPreviews } from "@/db/schema";
import { canManageCars, cleanText, forbidden, getAuthenticatedUser, getOrCreateAccount, unauthorized } from "../../../_lib";
export const dynamic = "force-dynamic";
async function authorize(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
}
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorize(request); if (denied) return denied;
  const { id } = await context.params;
  const [preview] = await getDb().select().from(comingSoonPreviews).where(eq(comingSoonPreviews.carId, id)).limit(1);
  return Response.json({ preview: preview || null }, { headers: { "Cache-Control": "private, no-store" } });
}
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorize(request); if (denied) return denied;
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Submit from this website." }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json();
  const title = cleanText(body.publicTitle, 140).replace(/[\r\n]/g, " ");
  const db = getDb();
  const [car] = await db.select({ id: cars.id }).from(cars).where(eq(cars.id, id)).limit(1);
  if (!car) return Response.json({ error: "Car not found." }, { status: 404 });
  if (body.enabled !== true) { await db.update(comingSoonPreviews).set({ enabled: false, updatedAt: Date.now() }).where(eq(comingSoonPreviews.carId, id)); return Response.json({ saved: true }); }
  if (!title || body.confirmed !== true) return Response.json({ error: "Confirm the public title and cover are safe to publish." }, { status: 400 });
  const [cover] = await db.select({ id: carFiles.id, contentType: carFiles.contentType }).from(carFiles).where(and(eq(carFiles.carId, id), eq(carFiles.category, "hero"))).orderBy(desc(carFiles.createdAt), desc(carFiles.sortOrder)).limit(1);
  if (!cover?.contentType.startsWith("image/")) return Response.json({ error: "Choose a safe hero cover first." }, { status: 400 });
  await db.insert(comingSoonPreviews).values({ carId: id, publicTitle: title, coverFileId: cover.id, enabled: true, updatedAt: Date.now() }).onConflictDoUpdate({ target: comingSoonPreviews.carId, set: { publicTitle: title, coverFileId: cover.id, enabled: true, updatedAt: Date.now() } });
  return Response.json({ saved: true });
}
