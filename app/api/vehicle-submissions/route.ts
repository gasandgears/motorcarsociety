import { getDb } from "@/db";
import { vehicleSubmissions } from "@/db/schema";
import { cleanText, serverError } from "../_lib";

export const dynamic = "force-dynamic";
const ownershipOptions = ["owner", "representative", "considering", "other"];

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (cleanText(body.website, 200)) return Response.json({ received: true });
    const submission = {
      name: cleanText(body.name, 120), email: cleanText(body.email, 180).toLowerCase(), phone: cleanText(body.phone, 50),
      year: cleanText(body.year, 12), make: cleanText(body.make, 80), model: cleanText(body.model, 120), location: cleanText(body.location, 160),
      ownership: cleanText(body.ownership, 30), story: cleanText(body.story, 4000), documentation: cleanText(body.documentation, 2000),
    };
    if (!submission.name || !submission.phone || !submission.year || !submission.make || !submission.model || !submission.location || !submission.story) return Response.json({ error: "Please complete all required fields." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!ownershipOptions.includes(submission.ownership)) return Response.json({ error: "Choose your relationship to the car." }, { status: 400 });
    if (body.consent !== true) return Response.json({ error: "Please confirm that we may contact you about the vehicle." }, { status: 400 });
    const now = Date.now();
    await getDb().insert(vehicleSubmissions).values({ id: crypto.randomUUID(), ...submission, status: "new", consentedAt: now, createdAt: now, updatedAt: now });
    return Response.json({ received: true }, { status: 201 });
  } catch (error) { return serverError(error, "Your vehicle submission could not be saved. Please contact Barnaby directly."); }
}
