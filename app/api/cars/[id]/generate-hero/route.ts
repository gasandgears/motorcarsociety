import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { carFiles } from "@/db/schema";
import { canManageCars, carExists, forbidden, getAuthenticatedUser, getBucket, getOrCreateAccount, serverError, unauthorized } from "../../../_lib";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type RouteContext = { params: Promise<{ id: string }> };

const HERO_PROMPT = `Create a premium Motorcar Society registry hero photograph from the supplied vehicle photograph.
Preserve the exact vehicle: body shape, paint color, trim, wheels, badges, proportions, stance, windows, and every identifying detail must remain faithful to the source.
Remove only the original surroundings and place the vehicle inside an elegant contemporary private collector gallery at blue hour: dark charcoal stone, floor-to-ceiling glass, distant hills and warm sunset sky, polished dark floor with a restrained natural reflection, soft architectural lighting.
Match the cinematic visual language of a discreet luxury motorcar society: deep blacks, warm highlights, restrained saturation, editorial automotive photography, realistic light direction and contact shadows.
Use a wide horizontal composition with the complete car clearly visible and generous darker negative space on the left for website copy. No people, no text, no logos added, no extra vehicles, no changes to the car.`;

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
    if (!sourceFileId) return Response.json({ error: "Choose a saved hero image first." }, { status: 400 });

    const [source] = await getDb().select().from(carFiles).where(and(eq(carFiles.id, sourceFileId), eq(carFiles.carId, carId), eq(carFiles.category, "hero"))).limit(1);
    if (!source || !["image/jpeg", "image/png", "image/webp"].includes(source.contentType)) return Response.json({ error: "Use a JPG, PNG, or WebP hero image for AI styling." }, { status: 415 });
    const stored = await getBucket().get(source.storageKey);
    if (!stored) return Response.json({ error: "The original hero image could not be loaded." }, { status: 404 });
    const sourceBytes = await new Response(stored.body).arrayBuffer();

    const form = new FormData();
    form.append("model", "gpt-image-1.5");
    form.append("prompt", HERO_PROMPT);
    form.append("image", new File([sourceBytes], source.filename, { type: source.contentType }));
    form.append("input_fidelity", "high");
    form.append("quality", "medium");
    form.append("size", "1536x1024");
    form.append("output_format", "webp");

    const editResponse = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: form });
    const editPayload = await editResponse.json() as { data?: Array<{ b64_json?: string }>; error?: { message?: string } };
    if (!editResponse.ok || !editPayload.data?.[0]?.b64_json) {
      console.error("OpenAI hero edit failed", editResponse.status, editPayload.error?.message);
      return Response.json({ error: editResponse.status === 429 ? "Image generation is temporarily unavailable or needs API credits." : "The Motorcar Society hero could not be generated. Please try again." }, { status: 502 });
    }

    const generatedBytes = Uint8Array.from(Buffer.from(editPayload.data[0].b64_json, "base64"));
    const fileId = crypto.randomUUID();
    const storageKey = `cars/${carId}/${fileId}`;
    const filename = `motorcar-society-hero-${Date.now()}.webp`;
    await getBucket().put(storageKey, new Blob([generatedBytes]).stream(), { httpMetadata: { contentType: "image/webp" }, customMetadata: { carId, filename, uploadedBy: user.id, generatedFrom: sourceFileId } });
    const file = { id: fileId, carId, storageKey, filename, contentType: "image/webp", sizeBytes: generatedBytes.byteLength, category: "hero", uploadedBy: user.id, uploadedByEmail: user.email, sortOrder: Date.now(), createdAt: Date.now() };
    try { await getDb().insert(carFiles).values(file); }
    catch (error) { await getBucket().delete(storageKey); throw error; }
    return Response.json({ file });
  } catch (error) {
    return serverError(error, "The Motorcar Society hero could not be generated. Please try again.");
  }
}
