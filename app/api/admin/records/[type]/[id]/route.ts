import { db, cleanText, forbidden, getAuthenticatedUser, getOrCreateAccount, isAdmin, mapRow, serverError, unauthorized } from "../../../../_lib";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ type: string; id: string }> };

const configs = {
  "dossier-requests": { table: "dossier_requests", id: "id", fields: ["status"], statuses: ["new", "contacted", "closed"] },
  "vehicle-submissions": { table: "vehicle_submissions", id: "id", fields: ["name", "email", "phone", "year", "make", "model", "location", "ownership", "story", "documentation", "status"], statuses: ["new", "contacted", "accepted", "declined"] },
  contacts: { table: "mailing_contacts", id: "id", fields: ["email", "display_name", "phone", "source", "permission", "invite_status"], statuses: [] },
  "wanted-list": { table: "wanted_vehicles", id: "id", fields: ["year", "make", "model", "variant", "acquisition_low", "acquisition_high", "notes", "status"], statuses: ["active", "matched", "paused", "closed"] },
  "registry-releases": { table: "cars", id: "id", fields: ["year", "make", "model", "seller_name", "seller_phone", "expected_price", "seller_email", "location", "vin", "notes", "exterior_color", "interior_color", "mileage", "body_style", "engine", "transmission", "drivetrain", "category", "short_description", "overview", "highlights", "condition_summary", "provenance", "restoration_summary", "visibility", "status"], statuses: ["intake", "review", "ready", "released"] },
  accounts: { table: "accounts", id: "user_id", fields: ["display_name", "phone", "location", "collection_notes", "role", "tier", "status"], statuses: ["pending", "approved", "denied"] },
} as const;

async function authorize(request: Request) {
  const user = getAuthenticatedUser(request); if (!user) return { response: unauthorized() };
  const account = await getOrCreateAccount(request); if (!isAdmin(account)) return { response: forbidden() };
  return { user, account };
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await authorize(request); if (auth.response) return auth.response;
  try {
    const { type, id } = await context.params; const config = configs[type as keyof typeof configs];
    if (!config) return Response.json({ error: "Unknown record type." }, { status: 404 });
    const client = db(); const { data, error } = await client.from(config.table).select("*").eq(config.id, id).maybeSingle();
    if (error) throw error; if (!data) return Response.json({ error: "Record not found." }, { status: 404 });
    const related: Record<string, unknown> = {};
    if (type === "dossier-requests") { const [{ data: car }, { data: member }] = await Promise.all([client.from("cars").select("year,make,model,registry_id").eq("id", data.car_id).maybeSingle(), client.from("accounts").select("email,display_name,phone,location").eq("user_id", data.requester_user_id).maybeSingle()]); related.car = car ? mapRow(car) : null; related.member = member ? mapRow(member) : null; }
    if (type === "wanted-list") { const { data: member } = await client.from("accounts").select("email,display_name,phone,location").eq("user_id", data.user_id).maybeSingle(); related.member = member ? mapRow(member) : null; }
    const { data: notes, error: notesError } = await client.from("admin_record_notes").select("*").eq("record_type", type).eq("record_id", id).order("created_at", { ascending: false });
    if (notesError) throw notesError;
    return Response.json({ record: mapRow(data), related, notes: (notes || []).map(mapRow) });
  } catch (error) { return serverError(error, "This admin record could not be loaded."); }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await authorize(request); if (auth.response) return auth.response;
  try {
    const { type, id } = await context.params; const config = configs[type as keyof typeof configs];
    if (!config) return Response.json({ error: "Unknown record type." }, { status: 404 });
    const body = await request.json() as Record<string, unknown>; const updates: Record<string, string | number> = {};
    for (const field of config.fields) { const camel = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()); if (camel in body) updates[field] = cleanText(body[camel], field.includes("description") || ["story", "documentation", "notes", "overview", "highlights", "provenance", "restoration_summary", "condition_summary", "collection_notes"].includes(field) ? 8000 : 240); }
    if ("status" in updates && config.statuses.length && !config.statuses.includes(updates.status as never)) return Response.json({ error: "Choose a valid status." }, { status: 400 });
    if (type === "contacts" && "permission" in updates && !["needs_review", "existing_client", "confirmed_opt_in", "unsubscribed"].includes(String(updates.permission))) return Response.json({ error: "Choose a valid contact permission." }, { status: 400 });
    if (type === "accounts") {
      if ("role" in updates && !["applicant", "member", "barnaby", "admin"].includes(String(updates.role))) return Response.json({ error: "Choose a valid role." }, { status: 400 });
      if ("tier" in updates && !["none", "standard", "priority", "private", "staff", "leadership"].includes(String(updates.tier))) return Response.json({ error: "Choose a valid membership level." }, { status: 400 });
      const client = db(); const { data: existing, error: existingError } = await client.from("accounts").select("email").eq("user_id", id).maybeSingle(); if (existingError) throw existingError;
      if (!existing) return Response.json({ error: "Account not found." }, { status: 404 });
      if (["deank@kirklanddigital.com", "bbforcars@gmail.com"].includes(String(existing.email).toLowerCase()) && (updates.role !== "admin" || updates.status !== "approved")) return Response.json({ error: "This administrator account must remain approved with the Admin role." }, { status: 400 });
      if (updates.status !== "approved") { updates.role = "applicant"; updates.tier = "none"; }
      else if (updates.role === "applicant") { updates.role = "member"; updates.tier = updates.tier === "none" ? "standard" : updates.tier; }
      else if (updates.role === "member" && updates.tier === "none") updates.tier = "standard";
      else if (updates.role === "barnaby" && updates.tier === "none") updates.tier = "staff";
      else if (updates.role === "admin" && updates.tier === "none") updates.tier = "leadership";
      if (updates.role === "barnaby") await client.from("accounts").update({ role: "member", tier: "standard", updated_at: Date.now() }).eq("role", "barnaby").neq("user_id", id);
    }
    updates.updated_at = Date.now(); const client = db(); const { data: saved, error } = await client.from(config.table).update(updates).eq(config.id, id).select("*").maybeSingle();
    if (error) throw error; if (!saved) return Response.json({ error: "Record not found." }, { status: 404 });
    return Response.json({ record: mapRow(saved) });
  } catch (error) { return serverError(error, "Changes to this record could not be saved."); }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await authorize(request); if (auth.response) return auth.response;
  try {
    const { type, id } = await context.params; const config = configs[type as keyof typeof configs];
    if (!config) return Response.json({ error: "Unknown record type." }, { status: 404 });
    const client = db(); const { data: existing, error: readError } = await client.from(config.table).select("*").eq(config.id, id).maybeSingle();
    if (readError) throw readError; if (!existing) return Response.json({ error: "Record not found." }, { status: 404 });
    if (type === "accounts") {
      const protectedEmails = ["deank@kirklanddigital.com", "bbforcars@gmail.com"];
      if (protectedEmails.includes(String(existing.email).toLowerCase())) return Response.json({ error: "This administrator account is protected and cannot be deleted." }, { status: 400 });
      const { error: authError } = await client.auth.admin.deleteUser(id); if (authError) throw authError;
    } else if (type === "registry-releases") return Response.json({ error: "Delete Registry cars from their car-file editor so attached media can be removed safely." }, { status: 409 });
    else { const { error } = await client.from(config.table).delete().eq(config.id, id); if (error) throw error; }
    await client.from("admin_record_notes").delete().eq("record_type", type).eq("record_id", id);
    return Response.json({ deleted: true });
  } catch (error) { return serverError(error, "This record could not be deleted."); }
}
