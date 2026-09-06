import { NextResponse } from "next/server";
import { createUserClient } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/safe-return-path";
export async function GET(request: Request) { const url = new URL(request.url); const next = safeReturnPath(url.searchParams.get("return_to")); await (await createUserClient()).auth.signOut(); return NextResponse.redirect(new URL(next, url.origin)); }
