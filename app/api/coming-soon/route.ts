import { getComingSoon } from "@/lib/coming-soon";
import { serverError } from "../_lib";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return Response.json({ cars: await getComingSoon() }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch (error) { return serverError(error, "Coming Soon previews are temporarily unavailable."); }
}
