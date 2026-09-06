"use client";

import { FormEvent, useState } from "react";

const initial = { name: "", email: "", phone: "", year: "", make: "", model: "", location: "", ownership: "", story: "", documentation: "", consent: false, website: "" };

export function VehicleSubmissionForm() {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try { const response = await fetch("/api/vehicle-submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }); const payload = await response.json() as { error?: string }; if (!response.ok) throw new Error(payload.error || "Your submission could not be saved."); setComplete(true); setForm(initial); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Your submission could not be saved."); }
    finally { setSaving(false); }
  };
  if (complete) return <section className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/[.08] p-8 sm:p-12" role="status"><p className="eyebrow">Submission received</p><h2 className="mt-4 font-display text-4xl">Thank you. Barnaby will review the car personally.</h2><p className="mt-5 leading-7 text-white/60">Your information remains private and no listing has been published. We will contact you using the details you provided.</p><button onClick={() => setComplete(false)} className="mt-8 min-h-12 rounded-lg border border-white/20 px-5 font-semibold">Submit another car</button></section>;
  const field = "mt-2 min-h-12 w-full rounded-lg border border-white/12 bg-white/[.045] px-4 text-white outline-none transition placeholder:text-white/28 focus:border-[var(--gold)]";
  return <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-[#181a19] p-6 sm:p-9"><div><p className="eyebrow">Private vehicle inquiry</p><h2 className="mt-3 font-display text-4xl">Tell us about the car.</h2></div><div className="mt-8 grid gap-5 sm:grid-cols-2">
    <label><span className="field-label">Your name</span><input required maxLength={120} autoComplete="name" value={form.name} onChange={(e) => update("name",e.target.value)} className={field} /></label>
    <label><span className="field-label">Email</span><input required type="email" maxLength={180} autoComplete="email" value={form.email} onChange={(e) => update("email",e.target.value)} className={field} /></label>
    <label><span className="field-label">Phone</span><input required type="tel" maxLength={50} autoComplete="tel" value={form.phone} onChange={(e) => update("phone",e.target.value)} className={field} /></label>
    <label><span className="field-label">Car location</span><input required maxLength={160} value={form.location} onChange={(e) => update("location",e.target.value)} className={field} placeholder="City and state" /></label>
    <label><span className="field-label">Year</span><input required maxLength={12} inputMode="numeric" value={form.year} onChange={(e) => update("year",e.target.value)} className={field} /></label>
    <label><span className="field-label">Make</span><input required maxLength={80} value={form.make} onChange={(e) => update("make",e.target.value)} className={field} /></label>
    <label><span className="field-label">Model</span><input required maxLength={120} value={form.model} onChange={(e) => update("model",e.target.value)} className={field} /></label>
    <label><span className="field-label">Your relationship to the car</span><select required value={form.ownership} onChange={(e) => update("ownership",e.target.value)} className={field}><option value="" className="text-black">Choose one</option><option value="owner" className="text-black">I own the car</option><option value="representative" className="text-black">I represent the owner</option><option value="considering" className="text-black">I am considering acquiring it</option><option value="other" className="text-black">Other</option></select></label>
    <label className="sm:col-span-2"><span className="field-label">The car’s story</span><textarea required maxLength={4000} value={form.story} onChange={(e) => update("story",e.target.value)} className={`${field} min-h-36 py-3`} placeholder="History, condition, significance and why you are submitting it" /></label>
    <label className="sm:col-span-2"><span className="field-label">Documentation available</span><textarea maxLength={2000} value={form.documentation} onChange={(e) => update("documentation",e.target.value)} className={`${field} min-h-28 py-3`} placeholder="Title, ownership history, restoration records, invoices, inspections, photographs…" /></label>
    <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website",e.target.value)} /></label>
  </div><label className="mt-6 flex items-start gap-3 text-sm leading-6 text-white/55"><input required type="checkbox" checked={form.consent} onChange={(e) => update("consent",e.target.checked)} className="mt-1 size-4 accent-[var(--gold)]" /><span>I confirm that I am authorized to provide this information and agree that Motorcar Society may contact me about this vehicle. This submission does not publish the car.</span></label>{error && <p className="mt-5 rounded-lg border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100" role="alert">{error}</p>}<button disabled={saving} className="mt-7 min-h-14 w-full rounded-lg bg-[var(--gold)] px-6 font-semibold text-[#111] disabled:opacity-50">{saving ? "Sending privately…" : "Submit for private review"}</button><p className="mt-4 text-center text-xs leading-5 text-white/35">Please do not include sensitive title numbers or financial account information in this initial form.</p></form>;
}
