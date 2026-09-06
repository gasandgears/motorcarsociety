import { NextResponse } from "next/server";
import { createUserClient } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/safe-return-path";
export async function GET(request: Request) { const url = new URL(request.url); const code = url.searchParams.get("code"); const next = safeReturnPath(url.searchParams.get("next")); if (code) await (await createUserClient()).auth.exchangeCodeForSession(code); return NextResponse.redirect(new URL(next, url.origin)); }
