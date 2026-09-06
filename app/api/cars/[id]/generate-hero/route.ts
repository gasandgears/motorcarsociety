import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { carFiles } from "@/db/schema";
import { canManageCars, carExists, forbidden, getAuthenticatedUser, getBucket, getOrCreateAccount, serverError, unauthorized } from "../../../_lib";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type RouteContext = { params: Promise<{ id: string }> };

const HERO_PROMPT = `Create a premium Motorcar Society registry hero photograph from the supplied vehicle photograph. Preserve the exact vehicle—body, paint, trim, wheels, badges, proportions and identifying details. Replace only the surroundings with the same visual language as the Motorcar Society homepage: an elegant contemporary private collector gallery at blue hour, dark charcoal stone, floor-to-ceiling glass, distant hills and warm sunset sky, polished dark floor, realistic architectural lighting and contact shadows. Use a wide horizontal composition with the complete car visible and darker negative space on the left. Deep blacks, warm highlights, restrained saturation and cinematic editorial automotive color grading. No people, text, added logos, extra vehicles or changes to the car.`;

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
    const form = new FormData();
    form.append("model", "gpt-image-1.5");
    form.append("prompt", HERO_PROMPT);
    form.append("image", new File([sourceBytes], source.filename, { type: source.contentType }));
    form.append("input_fidelity", "high");
    form.append("quality", "medium");
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
