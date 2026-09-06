import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { carFiles } from "@/db/schema";
import { canManageCars, forbidden, getAuthenticatedUser, getBucket, getOrCreateAccount, serverError, unauthorized } from "../../_lib";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id } = await context.params;
    const [file] = await getDb().select().from(carFiles).where(eq(carFiles.id, id)).limit(1);
    if (!file) return Response.json({ error: "File not found." }, { status: 404 });
    const object = await getBucket().get(file.storageKey);
    if (!object) return Response.json({ error: "File not found in storage." }, { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "private, max-age=300");
    const safeInlineTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime", "video/webm"]);
    headers.set("Content-Disposition", `${safeInlineTypes.has(file.contentType) ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.filename)}`);
    headers.set("Content-Security-Policy", "sandbox; default-src 'none'; img-src 'self' data: blob:; media-src 'self' blob:");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(object.body, { headers });
  } catch (error) {
    return serverError(error, "The file could not be opened.");
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id } = await context.params;
    const [file] = await getDb().select().from(carFiles).where(eq(carFiles.id, id)).limit(1);
    if (!file) return Response.json({ error: "File not found." }, { status: 404 });
    await getBucket().delete(file.storageKey);
    await getDb().delete(carFiles).where(eq(carFiles.id, id));
    return Response.json({ deleted: true });
  } catch (error) {
    return serverError(error, "The file could not be removed.");
  }
}
