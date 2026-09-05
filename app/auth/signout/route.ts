import { NextResponse } from "next/server";
import { createUserClient } from "@/lib/supabase/server";
export async function GET(request: Request) { const url = new URL(request.url); const next = url.searchParams.get("return_to")?.startsWith("/") ? url.searchParams.get("return_to")! : "/"; await (await createUserClient()).auth.signOut(); return NextResponse.redirect(new URL(next, url.origin)); }
