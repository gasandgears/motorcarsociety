import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { carFiles } from "@/db/schema";
import { canManageCars, carExists, forbidden, getAuthenticatedUser, getOrCreateAccount, safeFilename, serverError, unauthorized } from "../../../_lib";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function youtubeEmbedUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
    else if (host === "youtube.com" || host === "m.youtube.com") {
      id = url.searchParams.get("v") || "";
      if (!id) id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || "";
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
  } catch { return null; }
}

export async function POST(request: Request, context: RouteContext) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id: carId } = await context.params;
    if (!(await carExists(carId))) return Response.json({ error: "Car file not found." }, { status: 404 });
    const body = await request.json() as { url?: unknown; title?: unknown };
    const embedUrl = youtubeEmbedUrl(body.url);
    if (!embedUrl) return Response.json({ error: "Enter a valid YouTube or youtu.be video URL." }, { status: 400 });
    const filename = safeFilename(typeof body.title === "string" && body.title.trim() ? body.title.trim() : "YouTube walkaround video");
    const file = { id: crypto.randomUUID(), carId, storageKey: embedUrl, filename, contentType: "video/youtube", sizeBytes: 0, category: "video", uploadedBy: user.id, uploadedByEmail: user.email, sortOrder: Date.now(), createdAt: Date.now() };
    await getDb().insert(carFiles).values(file);
    return Response.json({ file }, { status: 201 });
  } catch (error) { return serverError(error, "The YouTube video link could not be saved."); }
}
