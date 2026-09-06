import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("x-supabase-user-id");
  headers.delete("x-supabase-user-email");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.next({ request: { headers } });
  const refreshedCookies: Parameters<NextResponse["cookies"]["set"]>[] = [];
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => { items.forEach(({ name, value, options }) => { request.cookies.set(name, value); refreshedCookies.push([{ name, value, ...options }]); }); } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email) { headers.set("x-supabase-user-id", user.id); headers.set("x-supabase-user-email", user.email); }
  const response = NextResponse.next({ request: { headers } });
  refreshedCookies.forEach((args) => response.cookies.set(...args));
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
