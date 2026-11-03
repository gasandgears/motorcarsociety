import { createUserClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const client = await createUserClient();
    const { data, error } = await client.auth.getUser();
    const eligible = !data.user && (!error || error.name === "AuthSessionMissingError");
    return Response.json({ eligible }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return Response.json({ eligible: false }, { headers: { "Cache-Control": "private, no-store" } }); }
}
