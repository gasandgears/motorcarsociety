"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
type Preview = { id: string; title: string; coverUrl: string };
export function ComingSoon() {
  const [cars, setCars] = useState<Preview[]>([]), [selected, setSelected] = useState<Preview | null>(null);
  const [startedAt, setStartedAt] = useState(0), [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState("");
  useEffect(() => { let active = true; fetch("/api/coming-soon", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(data => { if (active) setCars(data?.cars || []); }).catch(() => {}); return () => { active = false; }; }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/car-inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ carId: selected?.id, name: form.get("name"), phone: form.get("phone"), email: form.get("email"), website: form.get("website"), consent: form.get("consent") === "on", startedAt }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your inquiry could not be confirmed.");
      setMessage(data.notification === "sent" ? "Your inquiry has been saved and the email notification accepted. Barnaby can follow up with you about this car." : "Your inquiry has been saved. Email notification is delayed; you can also contact Barnaby directly.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Your inquiry could not be confirmed. Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="border-b border-white/10 bg-[#151716] px-5 py-16 sm:px-8 lg:px-12" aria-labelledby="coming-soon-title">
    <div className="mx-auto max-w-[90rem]"><p className="eyebrow">In preparation</p><h2 id="coming-soon-title" className="mt-3 font-display text-4xl text-white sm:text-5xl">Coming Soon</h2><p className="mt-4 max-w-2xl leading-7 text-white/60">These cars are being prepared for the Registry. Select a car to ask Barnaby for more information. Full listings open after release.</p>
      {!cars.length && <p className="mt-8 rounded-xl border border-white/10 p-6 text-white/60">More cars are in preparation. Contact Barnaby about upcoming arrivals.</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cars.map(car => <button key={car.id} type="button" onClick={() => { setSelected(car); setStartedAt(Date.now()); setMessage(""); setError(""); }} className="overflow-hidden rounded-xl border border-white/10 bg-[#1d201e] text-left transition hover:border-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)]">
        <img src={car.coverUrl} alt={car.title} loading="lazy" className="aspect-[16/9] w-full object-cover" /><div className="p-5"><p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--gold-light)]">Coming Soon</p><h3 className="mt-2 font-display text-2xl text-white">{car.title}</h3><p className="mt-3 text-sm text-white/60">Ask about this car →</p></div>
      </button>)}</div>
    </div>
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open && !busy) setSelected(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto border-white/15 bg-[#171a18] text-white"><DialogHeader><DialogTitle className="font-display text-3xl">To learn more about this car</DialogTitle><DialogDescription className="text-white/65">{selected?.title}. Leave your details so Barnaby can follow up.</DialogDescription></DialogHeader>
      {message ? <div role="status"><p className="leading-7">{message}</p><a href="/contact" className="mt-4 inline-block text-[var(--gold-light)] underline">Contact Barnaby</a><Button onClick={() => setSelected(null)} className="mt-6 block">Close</Button></div> : <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-2 text-sm">Name<input name="name" autoComplete="name" required minLength={2} maxLength={120} className="field" /></label>
        <label className="grid gap-2 text-sm">Phone number<input name="phone" type="tel" autoComplete="tel" required maxLength={50} className="field" /></label>
        <label className="grid gap-2 text-sm">Email address<input name="email" type="email" autoComplete="email" required maxLength={180} className="field" /></label>
        <div aria-hidden="true" className="absolute -left-[10000px]"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="flex gap-3 text-sm leading-6 text-white/70"><input name="consent" type="checkbox" required className="mt-1 size-4 shrink-0" />Motorcar Society may contact me about this car. This does not subscribe me to a newsletter.</label>
        {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
        <Button disabled={busy} type="submit" className="bg-[var(--gold)] text-black">{busy ? "Saving inquiry…" : "Send inquiry"}</Button>
        <a href="/contact" className="text-center text-sm text-white/60 underline">Or contact Barnaby directly</a>
      </form>}
    </DialogContent></Dialog>
  </section>;
}
