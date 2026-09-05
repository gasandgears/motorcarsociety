import { createAdminClient } from "@/lib/supabase/server";
export type AuthenticatedUser = { id: string; email: string };
export type Account = { userId: string; email: string; displayName: string; phone: string; location: string; collectionNotes: string; role: string; tier: string; status: string; createdAt: number; updatedAt: number };
export const db = () => createAdminClient();
export function getAuthenticatedUser(request: Request): AuthenticatedUser | null { const id = request.headers.get("x-supabase-user-id"); const email = request.headers.get("x-supabase-user-email"); return id && email ? { id, email } : null; }
export function unauthorized() { return Response.json({ error: "Please sign in again." }, { status: 401 }); }
export function forbidden() { return Response.json({ error: "You do not have access to this area." }, { status: 403 }); }
export function mapAccount(row: Record<string, any>): Account { return { userId: row.user_id, email: row.email, displayName: row.display_name, phone: row.phone, location: row.location, collectionNotes: row.collection_notes, role: row.role, tier: row.tier, status: row.status, createdAt: Number(row.created_at), updatedAt: Number(row.updated_at) }; }
export function mapRow(row: Record<string, any>) { const result: Record<string, any> = {}; for (const [key, value] of Object.entries(row)) result[key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())] = value; return result; }
export async function getOrCreateAccount(request: Request): Promise<Account | null> { const user = getAuthenticatedUser(request); if (!user) return null; const email = user.email.trim().toLowerCase(); const now = Date.now(); const bootstrap = email === "deank@kirklanddigital.com" || email === "bbforcars@gmail.com" ? { role: "admin", tier: "leadership", status: "approved" } : email === "deankirkland@me.com" ? { role: "member", tier: "standard", status: "approved" } : { role: "applicant", tier: "none", status: "pending" }; const client = db(); await client.from("accounts").upsert({ user_id: user.id, email, display_name: email.split("@")[0], phone: "", location: "", collection_notes: "", ...bootstrap, created_at: now, updated_at: now }, { onConflict: "user_id", ignoreDuplicates: true }); if (bootstrap.role !== "applicant") await client.from("accounts").update({ ...bootstrap, email, updated_at: now }).eq("user_id", user.id); const { data } = await client.from("accounts").select("*").eq("user_id", user.id).single(); return data ? mapAccount(data) : null; }
export function isBarnaby(account: Account | null) { return account?.role === "barnaby" && account.status === "approved"; }
export function isAdmin(account: Account | null) { return account?.role === "admin" && account.status === "approved"; }
export function canManageCars(account: Account | null) { return isBarnaby(account) || isAdmin(account); }
export function serverError(error: unknown, message = "The request could not be completed.") { console.error(error); return Response.json({ error: message }, { status: 500 }); }
export async function carExists(id: string) { const { data } = await db().from("cars").select("id").eq("id", id).maybeSingle(); return Boolean(data); }
export function getBucket() {
  const bucket = db().storage.from("vehicle-files");
  return {
    async put(
      key: string,
      body: ReadableStream,
      options?: {
        httpMetadata?: { contentType?: string };
        customMetadata?: Record<string, string>;
      },
    ) {
      const bytes = await new Response(body).arrayBuffer();
      const { error } = await bucket.upload(key, bytes, {
        contentType: options?.httpMetadata?.contentType || "application/octet-stream",
        upsert: false,
      });
      if (error) throw error;
    },
    async get(key: string) {
      const { data, error } = await bucket.download(key);
      if (error || !data) return null;
      return {
        body: data.stream(),
        writeHttpMetadata(headers: Headers) {
          headers.set("Content-Type", data.type || "application/octet-stream");
        },
      };
    },
    async delete(key: string) {
      const { error } = await bucket.remove([key]);
      if (error) throw error;
    },
  };
}
export function cleanText(value: unknown, maxLength = 4000) { return typeof value === "string" ? value.trim().slice(0, maxLength) : ""; }
export function safeFilename(value: string) { const decoded = (() => { try { return decodeURIComponent(value); } catch { return value; } })(); return decoded.replace(/[\u0000-\u001f\u007f]/g, "").replace(/[\\/]/g, "-").slice(0, 180) || "upload"; }
