import { db, cleanText, forbidden, getAuthenticatedUser, getOrCreateAccount, isAdmin, mapRow, serverError, unauthorized } from "../../_lib";

const recordTypes = ["dossier-requests", "vehicle-submissions", "contacts", "wanted-list", "registry-releases", "accounts"];

export async function POST(request: Request) {
  const user = getAuthenticatedUser(request); if (!user) return unauthorized();
  if (!isAdmin(await getOrCreateAccount(request))) return forbidden();
  try {
    const body = await request.json() as Record<string, unknown>; const recordType = cleanText(body.recordType, 40); const recordId = cleanText(body.recordId, 100); const note = cleanText(body.note, 4000);
    if (!recordTypes.includes(recordType) || !recordId || !note) return Response.json({ error: "Write a note before saving." }, { status: 400 });
    const now = Date.now(); const row = { id: crypto.randomUUID(), record_type: recordType, record_id: recordId, note, author_id: user.id, author_email: user.email, created_at: now, updated_at: now };
    const { data, error } = await db().from("admin_record_notes").insert(row).select("*").single(); if (error) throw error;
    return Response.json({ note: mapRow(data) }, { status: 201 });
  } catch (error) { return serverError(error, "The note could not be saved."); }
}
