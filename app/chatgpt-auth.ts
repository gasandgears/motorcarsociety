import { redirect } from "next/navigation";
import { createUserClient } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/safe-return-path";

export type ChatGPTUser = { displayName: string; email: string; fullName: string | null };
export async function getChatGPTUser(): Promise<ChatGPTUser | null> { if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null; const supabase = await createUserClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user?.email) return null; const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null; return { email: user.email, fullName, displayName: fullName || user.email }; }
export async function requireChatGPTUser(returnTo: string): Promise<ChatGPTUser> { const user = await getChatGPTUser(); if (user) return user; redirect(chatGPTSignInPath(returnTo)); }
export function chatGPTSignInPath(returnTo: string) { return `/signin?return_to=${encodeURIComponent(safeReturnPath(returnTo))}`; }
export function chatGPTSignOutPath(returnTo = "/") { return `/auth/signout?return_to=${encodeURIComponent(safeReturnPath(returnTo))}`; }
