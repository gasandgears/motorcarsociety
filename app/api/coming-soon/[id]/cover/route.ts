import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { cars, carFiles, comingSoonPreviews } from "@/db/schema";
import { comingSoonStatuses } from "@/lib/coming-soon";
import { getBucket, serverError } from "../../../_lib";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const [file] = await getDb().select({ storageKey: carFiles.storageKey, contentType: carFiles.contentType }).from(comingSoonPreviews)
      .innerJoin(cars, eq(cars.id, comingSoonPreviews.carId))
      .innerJoin(carFiles, and(eq(carFiles.id, comingSoonPreviews.coverFileId), eq(carFiles.carId, cars.id), eq(carFiles.category, "hero")))
      .where(and(eq(cars.id, id), eq(comingSoonPreviews.enabled, true), inArray(cars.status, comingSoonStatuses))).limit(1);
    if (!file?.contentType.startsWith("image/")) return new Response("Not found", { status: 404 });
    const object = await getBucket().get(file.storageKey);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
    object.writeHttpMetadata(headers);
    return new Response(object.body, { headers });
  } catch (error) { return serverError(error, "This cover could not be loaded."); }
}
