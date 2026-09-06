"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Field = {
  key: string;
  label: string;
  kind?: "textarea" | "select" | "readonly";
  options?: [string, string][];
};
type Note = {
  id: string;
  note: string;
  authorEmail: string;
  createdAt: number;
};
type RecordValue = string | number | null | undefined;
type AdminRecord = Record<string, RecordValue>;

const status = (...values: string[]): [string, string][] =>
  values.map((value) => [
    value,
    value.charAt(0).toUpperCase() + value.slice(1),
  ]);
const definitions: Record<
  string,
  {
    singular: string;
    title: (record: AdminRecord) => RecordValue;
    fields: Field[];
  }
> = {
  "dossier-requests": {
    singular: "Dossier request",
    title: (r) => r.requesterEmail || "Dossier request",
    fields: [
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: status("new", "contacted", "closed"),
      },
      { key: "requesterEmail", label: "Requester email", kind: "readonly" },
      { key: "createdAt", label: "Requested", kind: "readonly" },
    ],
  },
  "vehicle-submissions": {
    singular: "Vehicle submission",
    title: (r) => [r.year, r.make, r.model].filter(Boolean).join(" "),
    fields: [
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: status("new", "contacted", "accepted", "declined"),
      },
      { key: "name", label: "Contact name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "year", label: "Year" },
      { key: "make", label: "Make" },
      { key: "model", label: "Model" },
      { key: "location", label: "Location" },
      {
        key: "ownership",
        label: "Relationship to car",
        kind: "select",
        options: [
          ["owner", "Owner"],
          ["representative", "Owner representative"],
          ["considering", "Considering acquisition"],
          ["other", "Other"],
        ],
      },
      { key: "story", label: "Vehicle story", kind: "textarea" },
      {
        key: "documentation",
        label: "Documentation available",
        kind: "textarea",
      },
    ],
  },
  contacts: {
    singular: "Client contact",
    title: (r) => r.displayName || r.email || "Client contact",
    fields: [
      { key: "displayName", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "source", label: "Source" },
      {
        key: "permission",
        label: "Email permission",
        kind: "select",
        options: [
          ["needs_review", "Needs review"],
          ["existing_client", "Existing client"],
          ["confirmed_opt_in", "Confirmed opt-in"],
          ["unsubscribed", "Do not contact"],
        ],
      },
      {
        key: "inviteStatus",
        label: "Invitation status",
        kind: "select",
        options: [
          ["not_sent", "Not sent"],
          ["sent", "Sent"],
          ["accepted", "Accepted"],
        ],
      },
    ],
  },
  "wanted-list": {
    singular: "Wanted request",
    title: (r) =>
      [r.year, r.make, r.model].filter(Boolean).join(" ") || "Wanted request",
    fields: [
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: status("active", "matched", "paused", "closed"),
      },
      { key: "year", label: "Year or range" },
      { key: "make", label: "Make" },
      { key: "model", label: "Model" },
      { key: "variant", label: "Variant / specification" },
      { key: "acquisitionLow", label: "Acquisition low" },
      { key: "acquisitionHigh", label: "Acquisition high" },
      { key: "notes", label: "Member’s requirements", kind: "textarea" },
    ],
  },
  "registry-releases": {
    singular: "Registry release",
    title: (r) =>
      [r.year, r.make, r.model].filter(Boolean).join(" ") || "Registry car",
    fields: [
      { key: "registryId", label: "Registry ID", kind: "readonly" },
      {
        key: "status",
        label: "Release status",
        kind: "select",
        options: status("intake", "review", "ready", "released"),
      },
      {
        key: "visibility",
        label: "Audience",
        kind: "select",
        options: [
          ["private", "Private match"],
          ["members", "Members"],
          ["public", "Public"],
        ],
      },
      { key: "year", label: "Year" },
      { key: "make", label: "Make" },
      { key: "model", label: "Model" },
      { key: "category", label: "Category" },
      { key: "location", label: "Location" },
      { key: "expectedPrice", label: "Expected price" },
      { key: "sellerName", label: "Seller name" },
      { key: "sellerEmail", label: "Seller email" },
      { key: "sellerPhone", label: "Seller phone" },
      { key: "vin", label: "VIN / chassis" },
      { key: "exteriorColor", label: "Exterior color" },
      { key: "interiorColor", label: "Interior color" },
      { key: "mileage", label: "Mileage" },
      { key: "bodyStyle", label: "Body style" },
      { key: "engine", label: "Engine" },
      { key: "transmission", label: "Transmission" },
      { key: "drivetrain", label: "Drivetrain" },
      { key: "shortDescription", label: "Short description", kind: "textarea" },
      { key: "overview", label: "Long description", kind: "textarea" },
      { key: "highlights", label: "Highlights", kind: "textarea" },
      { key: "conditionSummary", label: "Condition", kind: "textarea" },
      { key: "provenance", label: "Provenance", kind: "textarea" },
      { key: "restorationSummary", label: "Restoration", kind: "textarea" },
      { key: "notes", label: "Seller notes", kind: "textarea" },
    ],
  },
  accounts: {
    singular: "Account",
    title: (r) => r.displayName || r.email || "Account",
    fields: [
      { key: "email", label: "Email", kind: "readonly" },
      { key: "displayName", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "location", label: "Location" },
      {
        key: "status",
        label: "Approval status",
        kind: "select",
        options: status("pending", "approved", "denied"),
      },
      {
        key: "role",
        label: "Role",
        kind: "select",
        options: [
          ["applicant", "Applicant"],
          ["member", "Member"],
          ["barnaby", "Barnaby"],
          ["admin", "Admin"],
        ],
      },
      {
        key: "tier",
        label: "Membership level",
        kind: "select",
        options: [
          ["none", "None"],
          ["standard", "Verified"],
          ["priority", "Priority"],
          ["private", "Private Client"],
          ["staff", "Staff"],
          ["leadership", "Leadership"],
        ],
      },
      { key: "collectionNotes", label: "Collection profile", kind: "textarea" },
    ],
  },
};

function displayValue(key: string, value: unknown) {
  if ((key === "createdAt" || key === "updatedAt") && Number(value))
    return new Date(Number(value)).toLocaleString();
  return String(value ?? "");
}

export function AdminRecordDetail({ type, id }: { type: string; id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const definition = definitions[type];
  const [record, setRecord] = useState<AdminRecord | null>(null);
  const [related, setRelated] = useState<Record<string, AdminRecord | null>>(
    {},
  );
  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matchCar, setMatchCar] = useState<AdminRecord | null>(null);
  const endpoint = `/api/admin/records/${type}/${encodeURIComponent(id)}`;
  useEffect(() => {
    let active = true;
    fetch(endpoint, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "Record unavailable.");
        if (active) {
          setRecord(payload.record);
          setRelated(payload.related || {});
          setNotes(payload.notes || []);
        }
      })
      .catch((caught) => {
        if (active)
          setError(
            caught instanceof Error ? caught.message : "Record unavailable.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [endpoint]);
  useEffect(() => {
    const matchId = searchParams.get("match");
    if (type !== "wanted-list" || !matchId) return;
    let active = true;
    fetch(`/api/cars/${encodeURIComponent(matchId)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (active && response.ok) setMatchCar(payload.car || null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [searchParams, type]);
  const title = useMemo(
    () =>
      String(
        record && definition
          ? definition.title(record)
          : definition?.singular || "Admin record",
      ),
    [record, definition],
  );
  const save = async () => {
    if (!record) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(record),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Changes could not be saved.");
      setRecord(payload.record);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Changes could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };
  const addNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/record-notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recordType: type, recordId: id, note }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "The note could not be saved.");
      setNotes((current) => [payload.note, ...current]);
      setNote("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The note could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (
      !record ||
      !window.confirm(
        `Permanently delete ${definition.singular.toLowerCase()} “${title}”? This cannot be undone.`,
      )
    )
      return;
    setSaving(true);
    setError("");
    try {
      const deleteEndpoint =
        type === "registry-releases" ? `/api/admin/cars/${id}` : endpoint;
      const response = await fetch(deleteEndpoint, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "This record could not be deleted.");
      router.push(`/admin/${type}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "This record could not be deleted.",
      );
      setSaving(false);
    }
  };
  if (!definition)
    return (
      <main className="min-h-screen bg-[#e9e5dc] p-10 text-black">
        Unknown admin record.
      </main>
    );
  if (loading)
    return (
      <main className="min-h-screen bg-[#e9e5dc] p-10 text-black/50">
        Loading record…
      </main>
    );
  return (
    <main className="min-h-screen bg-[#e9e5dc] px-5 py-10 text-[#171918] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/admin/${type}`}
          className="text-sm font-semibold text-[#806c49]"
        >
          ← Back to {definition.singular}
        </Link>
        <div className="mt-7 flex flex-col justify-between gap-5 border-b border-black/10 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#806c49]">
              {definition.singular}
            </p>
            <h1 className="mt-3 font-display text-4xl sm:text-6xl">{title}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {type === "registry-releases" && (
              <Link
                href={`/admin/registry-releases/${encodeURIComponent(id)}/edit`}
                className="inline-flex min-h-12 items-center rounded-lg bg-[#806c49] px-6 font-semibold text-white hover:bg-[#695737]"
              >
                Edit car file &amp; photos
              </Link>
            )}
            <button
              disabled={saving || !record}
              onClick={() => void save()}
              className="min-h-12 rounded-lg bg-[#171918] px-6 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              disabled={saving || !record}
              onClick={() => void remove()}
              className="min-h-12 rounded-lg border border-red-800/25 px-5 font-semibold text-red-800 hover:bg-red-800 hover:text-white"
            >
              Delete
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-6 rounded-lg border border-red-800/20 bg-red-50 p-4 text-red-900">
            {error}
          </p>
        )}
        {record && (
          <>
            <section className="mt-8 rounded-2xl border border-black/10 bg-white/75 p-5 sm:p-8">
              <h2 className="font-display text-3xl">Record details</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {definition.fields.map((field) => (
                  <label
                    key={field.key}
                    className={field.kind === "textarea" ? "sm:col-span-2" : ""}
                  >
                    <span className="admin-label">{field.label}</span>
                    {field.kind === "readonly" ? (
                      <div className="mt-2 min-h-12 rounded-lg bg-black/[.045] px-4 py-3 text-sm text-black/58">
                        {displayValue(field.key, record[field.key]) || "—"}
                      </div>
                    ) : field.kind === "textarea" ? (
                      <textarea
                        value={record[field.key] || ""}
                        onChange={(event) =>
                          setRecord({
                            ...record,
                            [field.key]: event.target.value,
                          })
                        }
                        className="admin-field mt-2 min-h-32 resize-y"
                      />
                    ) : field.kind === "select" ? (
                      <select
                        value={record[field.key] || ""}
                        onChange={(event) =>
                          setRecord({
                            ...record,
                            [field.key]: event.target.value,
                          })
                        }
                        className="admin-field mt-2"
                      >
                        {field.options?.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={record[field.key] || ""}
                        onChange={(event) =>
                          setRecord({
                            ...record,
                            [field.key]: event.target.value,
                          })
                        }
                        className="admin-field mt-2"
                      />
                    )}
                  </label>
                ))}
              </div>
            </section>
            {Object.keys(related).length > 0 && (
              <section className="mt-6 rounded-2xl border border-black/10 bg-white/75 p-5 sm:p-8">
                <h2 className="font-display text-3xl">Connected information</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {Object.entries(related).map(([group, values]) => (
                    <div key={group}>
                      <p className="admin-label">{group}</p>
                      <dl className="mt-3 space-y-2">
                        {values &&
                          Object.entries(values).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between gap-5 border-b border-black/6 pb-2 text-sm"
                            >
                              <dt className="text-black/45">
                                {key.replace(
                                  /[A-Z]/g,
                                  (letter) => ` ${letter.toLowerCase()}`,
                                )}
                              </dt>
                              <dd className="text-right font-medium">
                                {displayValue(key, value)}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
        {matchCar && related.member?.email && (
          <section className="mt-6 rounded-2xl border border-[#806c49]/25 bg-[#806c49]/10 p-5 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#806c49]">
              Suggested Registry match
            </p>
            <h2 className="mt-3 font-display text-3xl">
              {String(matchCar.year || "")} {String(matchCar.make || "")}{" "}
              {String(matchCar.model || "")}
            </h2>
            <p className="mt-3 text-sm text-black/52">
              Send this member a private invitation to view the matching car.
            </p>
            <a
              href={`mailto:${String(related.member.email)}?subject=${encodeURIComponent(`Private Registry match: ${String(matchCar.year || "")} ${String(matchCar.make || "")} ${String(matchCar.model || "")}`)}&body=${encodeURIComponent(`A vehicle matching your Motorcar Society Wanted List is now available for private review:\n\n${window.location.origin}/registry/${String(matchCar.id)}`)}`}
              className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-[#806c49] px-6 font-semibold text-white"
            >
              Invite member to view
            </a>
          </section>
        )}
        <section className="mt-6 rounded-2xl border border-black/10 bg-white/75 p-5 sm:p-8">
          <h2 className="font-display text-3xl">Internal notes</h2>
          <p className="mt-2 text-sm text-black/48">
            Only Motorcar Society administrators can see these notes.
          </p>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="admin-field mt-5 min-h-28 resize-y"
            placeholder="Add a follow-up, decision, conversation summary or next step…"
          />
          <button
            disabled={saving || !note.trim()}
            onClick={() => void addNote()}
            className="mt-3 min-h-11 rounded-lg bg-[#806c49] px-5 font-semibold text-white disabled:opacity-40"
          >
            Add note
          </button>
          <div className="mt-7 space-y-3">
            {notes.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-black/8 bg-[#f7f5ef] p-4"
              >
                <p className="whitespace-pre-line text-sm leading-6">
                  {item.note}
                </p>
                <p className="mt-3 text-xs text-black/38">
                  {item.authorEmail} ·{" "}
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
            {!notes.length && (
              <p className="text-sm text-black/40">No internal notes yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
