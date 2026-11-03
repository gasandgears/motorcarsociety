import { readPublicForm } from "@/lib/public-form";
import { createHash } from "node:crypto";
import { and, count, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { cars, carFiles, carInquiries, comingSoonPreviews } from "@/db/schema";
import { comingSoonStatuses } from "@/lib/coming-soon";
import { inArray } from "drizzle-orm";
import { validateCarInquiry } from "@/lib/inquiry-validation";
import { notifyCarInquiry } from "@/lib/inquiry-notifications";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Please submit this form from our website." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Invalid form submission." }, { status: 415 });
  try {
    const body = await readPublicForm(request);
    if (!body) return Response.json({ error: "Invalid or oversized form submission." }, { status: 400 });
    const now = Date.now(), valid = validateCarInquiry(body, now);
    if ("spam" in valid) return Response.json({ received: true }, { status: 202 });
    if ("error" in valid) return Response.json({ error: valid.error }, { status: 400 });
    const input = valid.value;
    const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = createHash("sha256").update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:${ip}`).digest("hex");
    const db = getDb();
    const result = await db.transaction(async tx => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${ipHash}, 0))`);
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${input.email}, 1))`);
      const [preview] = await tx.select({ title: comingSoonPreviews.publicTitle }).from(comingSoonPreviews)
        .innerJoin(cars, eq(cars.id, comingSoonPreviews.carId))
        .innerJoin(carFiles, and(eq(carFiles.id, comingSoonPreviews.coverFileId), eq(carFiles.carId, cars.id), eq(carFiles.category, "hero")))
        .where(and(eq(cars.id, input.carId), eq(comingSoonPreviews.enabled, true), inArray(cars.status, comingSoonStatuses))).limit(1);
      if (!preview) return { unavailable: true as const };
      const [existing] = await tx.select().from(carInquiries).where(and(eq(carInquiries.carId, input.carId), eq(carInquiries.email, input.email), gt(carInquiries.createdAt, now - 900000))).limit(1);
      if (existing) return { duplicate: existing };
      const [ipCount] = await tx.select({ value: count() }).from(carInquiries).where(and(eq(carInquiries.ipHash, ipHash), gt(carInquiries.createdAt, now - 3600000)));
      const [emailCount] = await tx.select({ value: count() }).from(carInquiries).where(and(eq(carInquiries.email, input.email), gt(carInquiries.createdAt, now - 3600000)));
      if ((ipCount?.value || 0) >= 5 || (emailCount?.value || 0) >= 5) return { limited: true as const };
      const inquiry = { id: crypto.randomUUID(), ...input, carTitle: preview.title, ipHash, notificationStatus: "pending", consentedAt: now, createdAt: now };
      await tx.insert(carInquiries).values(inquiry);
      return { inquiry };
    });
    if ("unavailable" in result) return Response.json({ error: "This car is no longer in Coming Soon. Please contact Barnaby about current availability." }, { status: 409 });
    if ("limited" in result) return Response.json({ error: "Too many inquiries. Please try again later or contact Barnaby directly." }, { status: 429, headers: { "Retry-After": "3600" } });
    if (result.duplicate) return Response.json({ received: true, notification: result.duplicate.notificationStatus === "sent" ? "sent" : "pending" });
    const sent = await notifyCarInquiry(result.inquiry);
    if (sent) await db.update(carInquiries).set({ notificationStatus: "sent", notifiedAt: Date.now() }).where(eq(carInquiries.id, result.inquiry.id));
    return Response.json({ received: true, notification: sent ? "sent" : "pending" }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch { return Response.json({ error: "Your inquiry could not be confirmed. Please try again or contact Barnaby directly." }, { status: 500 }); }
}
