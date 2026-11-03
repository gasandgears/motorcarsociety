import { createHash } from "node:crypto";
import { and, count, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { mailingContacts, newsletterSignupAttempts } from "@/db/schema";
import { visitorSignupInput } from "@/lib/visitor-signup";
import { readPublicForm } from "@/lib/public-form";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Please use the signup form on this website." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return Response.json({ error: "Invalid signup." }, { status: 415 });
  try {
    const raw = await readPublicForm(request, 4096);
    if (!raw) return Response.json({ error: "Please complete the form and try again." }, { status: 400 });
    if (raw.website) return Response.json({ saved: true });
    const input = visitorSignupInput.safeParse(raw);
    if (!input.success) return Response.json({ error: "Enter your name, valid email, optional phone and explicit newsletter consent." }, { status: 400 });
    const now = Date.now();
    if (now - input.data.startedAt < 2000 || now - input.data.startedAt > 7200000) return Response.json({ error: "Please reopen the form and try again." }, { status: 400 });
    const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = createHash("sha256").update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:${ip}`).digest("hex");
    const result = await getDb().transaction(async tx => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${ipHash}, 2))`);
      const [attempts] = await tx.select({ value: count() }).from(newsletterSignupAttempts).where(and(eq(newsletterSignupAttempts.ipHash, ipHash), gt(newsletterSignupAttempts.createdAt, now - 3600000)));
      if ((attempts?.value || 0) >= 5) return false;
      await tx.insert(newsletterSignupAttempts).values({ id: crypto.randomUUID(), ipHash, createdAt: now });
      // Public signup cannot overwrite an existing contact or reverse an unsubscribe.
      await tx.insert(mailingContacts).values({ id: crypto.randomUUID(), email: input.data.email, displayName: input.data.name, phone: input.data.phone, source: "registry-newsletter-popup-v1", permission: "confirmed_opt_in", inviteStatus: "not_sent", createdAt: now, updatedAt: now }).onConflictDoNothing({ target: mailingContacts.email });
      return true;
    });
    if (!result) return Response.json({ error: "Too many signup attempts. Please try again later." }, { status: 429, headers: { "Retry-After": "3600" } });
    return Response.json({ saved: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return Response.json({ error: "Your signup could not be confirmed. Your details remain in the form; please try again." }, { status: 503 }); }
}
