import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { carInquiries } from "@/db/schema";
import { canManageCars, forbidden, getAuthenticatedUser, getOrCreateAccount, unauthorized } from "../../_lib";
import { notifyCarInquiry } from "@/lib/inquiry-notifications";
export const dynamic = "force-dynamic";
async function authorize(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
}
export async function GET(request: Request) {
  const denied = await authorize(request); if (denied) return denied;
  const inquiries = await getDb().select({ id: carInquiries.id, carId: carInquiries.carId, carTitle: carInquiries.carTitle, name: carInquiries.name, email: carInquiries.email, phone: carInquiries.phone, notificationStatus: carInquiries.notificationStatus, createdAt: carInquiries.createdAt }).from(carInquiries).orderBy(desc(carInquiries.createdAt)).limit(200);
  return Response.json({ inquiries }, { headers: { "Cache-Control": "private, no-store" } });
}
export async function POST(request: Request) {
  const denied = await authorize(request); if (denied) return denied;
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Submit from this website." }, { status: 403 });
  const { id } = await request.json();
  const [inquiry] = await getDb().select().from(carInquiries).where(eq(carInquiries.id, String(id))).limit(1);
  if (!inquiry) return Response.json({ error: "Inquiry not found." }, { status: 404 });
  if (inquiry.notificationStatus === "sent") return Response.json({ sent: true });
  const sent = await notifyCarInquiry(inquiry);
  if (!sent) return Response.json({ error: "Email delivery is not configured or the provider did not accept the notification. The inquiry remains saved." }, { status: 503 });
  await getDb().update(carInquiries).set({ notificationStatus: "sent", notifiedAt: Date.now() }).where(eq(carInquiries.id, id));
  return Response.json({ sent: true });
}
