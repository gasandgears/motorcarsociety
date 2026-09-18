import { and, asc, eq, inArray } from "drizzle-orm";

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
    const paidMember = member && ["standard", "priority", "private"].includes(account?.tier || "");
    const [car] = await getDb().select({ visibility: cars.visibility, status: cars.status }).from(cars).where(eq(cars.id, id)).limit(1);
    if (!car) return new Response("Not found", { status: 404 });
    const [file] = await getDb().select().from(carFiles).where(and(eq(carFiles.id, fileId), eq(carFiles.carId, id), inArray(carFiles.category, ["hero", "photos", "video"]))).limit(1);
    if (!file || (!file.contentType.startsWith("image/") && !file.contentType.startsWith("video/"))) return new Response("Not found", { status: 404 });
    if (!staff && car.status !== "released") return new Response("Forbidden", { status: 403 });
    if (!account && file.category !== "hero") return new Response("Forbidden", { status: 403 });
    if (account && !staff && !member) return new Response("Forbidden", { status: 403 });
    if (member && !paidMember) {
      if (file.category === "video") return new Response("Paid membership required", { status: 403 });
      const gallery = await getDb().select({ id: carFiles.id, category: carFiles.category, createdAt: carFiles.createdAt }).from(carFiles)
        .where(and(eq(carFiles.carId, id), inArray(carFiles.category, ["hero", "photos"])))
        .orderBy(asc(carFiles.sortOrder), asc(carFiles.createdAt));
      const allowed = gallery.sort((a, b) => Number(b.category === "hero") - Number(a.category === "hero") || (a.category === "hero" && b.category === "hero" ? b.createdAt - a.createdAt : 0)).slice(0, 5);
      if (!allowed.some((photo) => photo.id === fileId)) return new Response("Paid membership required", { status: 403 });
    }
    const object = await getBucket().get(file.storageKey);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", account ? "private, max-age=300" : "public, max-age=300, s-maxage=300");
    headers.set("Accept-Ranges", "bytes");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(object.body, { headers });
  } catch (error) {
    return serverError(error, "The vehicle photo could not be opened.");
  }
}
