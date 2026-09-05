import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { carFiles, cars } from "@/db/schema";
import { getAuthenticatedUser, getBucket, getOrCreateAccount, serverError } from "../../../../_lib";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string; fileId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id, fileId } = await context.params;
    const account = getAuthenticatedUser(request) ? await getOrCreateAccount(request) : null;
    const staff = account?.status === "approved" && (account.role === "admin" || account.role === "barnaby");
    const member = account?.status === "approved" && account.role === "member";
    const [car] = await getDb().select({ visibility: cars.visibility, status: cars.status }).from(cars).where(eq(cars.id, id)).limit(1);
    if (!car) return new Response("Not found", { status: 404 });
    if (!(staff || (car.status === "released" && (car.visibility === "public" || (member && car.visibility === "members"))))) return new Response("Forbidden", { status: 403 });
    const [file] = await getDb().select().from(carFiles).where(and(eq(carFiles.id, fileId), eq(carFiles.carId, id), inArray(carFiles.category, ["photos", "video"]))).limit(1);
    if (!file || (!file.contentType.startsWith("image/") && !file.contentType.startsWith("video/"))) return new Response("Not found", { status: 404 });
    const object = await getBucket().get(file.storageKey);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "private, max-age=300");
    headers.set("Accept-Ranges", "bytes");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(object.body, { headers });
  } catch (error) {
    return serverError(error, "The vehicle photo could not be opened.");
  }
}
