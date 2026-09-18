import { and, eq, inArray } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

import { getDb } from "@/db";
import { carFiles } from "@/db/schema";
import { canManageCars, carExists, forbidden, getAuthenticatedUser, getBucket, getOrCreateAccount, serverError, unauthorized } from "../../../_lib";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type RouteContext = { params: Promise<{ id: string }> };

const HERO_REFERENCES = [
  "society-hero-original.jpg",
  "society-hero-european-gt.jpg",
  "society-hero-american-convertible.jpg",
];

const HERO_PROMPT = `Image 1 is the authoritative subject photograph. Images 2–4 are Motorcar Society homepage style references only.

Create a new 3:2 landscape Registry hero that belongs to the exact same photographic series as images 2–4. Preserve the vehicle from image 1 exactly: model and body shape, paint color, trim, badges, glass, lights, grille, wheels, tires, stance, proportions, and visible condition. Do not borrow, blend, or copy any vehicle from the style references.

Match the established scene precisely: a dark, minimal private collector gallery; monolithic matte charcoal stone wall across the left; polished dark concrete floor; slim black floor-to-ceiling glazing on the right; distant mountain or lakeside silhouettes; restrained blue-hour sky. Place the complete vehicle in the lower-right 55–65% of the frame, leaving broad, uncluttered, near-black negative space on the left for editorial copy. Use an eye-level or subtly low three-quarter automotive camera angle.

Match the homepage color and light: dense neutral near-black shadows that retain surface detail; cool steel-blue ambient window light; subtle warm bronze practical highlights; restrained saturation; faithful vehicle paint; controlled chrome without clipped whites; soft directional key light; realistic contact shadow and understated floor reflection. The result must read as a refined real photograph, not CGI and not a generic dealership or white-box studio.

No people, text, signs, added logos, other cars, props, neon, fog, motion effects, excessive spotlights, or invented license-plate content.`;

export async function POST(request: Request, context: RouteContext) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return Response.json({ error: "The image editor has not been connected yet." }, { status: 503 });
    const { id: carId } = await context.params;
    if (!(await carExists(carId))) return Response.json({ error: "Car file not found." }, { status: 404 });
    const body = await request.json().catch(() => ({})) as { sourceFileId?: unknown };
    const sourceFileId = typeof body.sourceFileId === "string" ? body.sourceFileId : "";
    const [source] = sourceFileId ? await getDb().select().from(carFiles).where(and(eq(carFiles.id, sourceFileId), eq(carFiles.carId, carId), inArray(carFiles.category, ["photos", "hero"]))).limit(1) : [];
    if (!source || !["image/jpeg", "image/png", "image/webp"].includes(source.contentType)) return Response.json({ error: "Choose a JPG, PNG or WebP cover photo." }, { status: 415 });
    const stored = await getBucket().get(source.storageKey);
    if (!stored) return Response.json({ error: "The cover photo could not be loaded." }, { status: 404 });
    const sourceBytes = await new Response(stored.body).arrayBuffer();
    const normalizedSource = await sharp(Buffer.from(sourceBytes)).rotate().png().toBuffer();
    const referenceImages = await Promise.all(HERO_REFERENCES.map((filename) => readFile(join(process.cwd(), "public", filename))));
    const form = new FormData();
    form.append("model", "gpt-image-2.5-sunburst");
    form.append("prompt", HERO_PROMPT);
    form.append("image[]", new File([Uint8Array.from(normalizedSource)], "subject-vehicle.png", { type: "image/png" }));
    HERO_REFERENCES.forEach((filename, index) => form.append("image[]", new File([Uint8Array.from(referenceImages[index])], filename, { type: "image/jpeg" })));
    form.append("quality", "high");
    form.append("size", "1536x1024");
    form.append("output_format", "webp");
    const editResponse = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${apiKey.trim()}` }, body: form });
    const editPayload = await editResponse.json() as { data?: Array<{ b64_json?: string }>; error?: { message?: string } };
    if (!editResponse.ok || !editPayload.data?.[0]?.b64_json) {
      console.error("OpenAI hero edit failed", editResponse.status, editPayload.error?.message);
      return Response.json({ error: editResponse.status === 429 ? "Automatic hero styling needs OpenAI API credits." : "The listing hero could not be styled. Please try again." }, { status: 502 });
    }
    const generatedBytes = Uint8Array.from(Buffer.from(editPayload.data[0].b64_json, "base64"));
    const fileId = crypto.randomUUID();
    const storageKey = `cars/${carId}/${fileId}`;
    const filename = `listing-hero-${Date.now()}.webp`;
    await getBucket().put(storageKey, new Blob([generatedBytes]).stream(), { httpMetadata: { contentType: "image/webp" } });
    const file = { id: fileId, carId, storageKey, filename, contentType: "image/webp", sizeBytes: generatedBytes.byteLength, category: "hero", uploadedBy: user.id, uploadedByEmail: user.email, sortOrder: Date.now(), createdAt: Date.now() };
    try { await getDb().insert(carFiles).values(file); } catch (error) { await getBucket().delete(storageKey); throw error; }
    return Response.json({ file });
  } catch (error) {
    return serverError(error, "The listing hero could not be styled. Please try again.");
  }
}
