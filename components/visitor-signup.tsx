"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
const storageKey = "mcs:registry-visitor-signup:v1";
let handled = false;
function remember() { handled = true; try { localStorage.setItem(storageKey, "handled"); } catch {} }
export function VisitorSignup() {
  const path = usePathname();
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [saved, setSaved] = useState(false), [error, setError] = useState("");
  const startedAt = useRef(0), submitting = useRef(false);
  useEffect(() => {
    if (handled || /^\/(admin|api|signin|auth|reset-password)(\/|$)/.test(path)) return;
    try { if (localStorage.getItem(storageKey)) return; } catch { return; }
    const controller = new AbortController();
    fetch("/api/visitor-status", { cache: "no-store", credentials: "same-origin", signal: controller.signal }).then(r => r.ok ? r.json() : null).then(status => { if (!controller.signal.aborted && status?.eligible === true && !handled) { startedAt.current = Date.now(); setOpen(true); } }).catch(() => {});
    return () => controller.abort();
  }, [path]);
  useEffect(() => {
    const client = createClient();
    const { data } = client.auth.onAuthStateChange((_event, session) => { if (session?.user) { remember(); setOpen(false); } });
    return () => data.subscription.unsubscribe();
  }, []);
  function dismiss() { remember(); setOpen(false); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting.current) return; submitting.current = true; setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/newsletter", { method: "POST", signal: AbortSignal.timeout(15000), headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: form.get("phone"), consent: form.get("consent") === "on", website: form.get("website"), startedAt: startedAt.current }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Your signup could not be confirmed."); remember(); setSaved(true);
    } catch (caught) { setError(caught instanceof Error && caught.name !== "TimeoutError" ? caught.message : "We could not confirm your signup. Please try again; duplicate submissions are safe."); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={value => { if (!value) dismiss(); }}><DialogContent className="max-h-[90vh] overflow-y-auto border-white/15 bg-[#171a18] text-white"><DialogHeader><DialogTitle className="font-display text-3xl">{saved ? "Your request is saved." : "Stay in the conversation."}</DialogTitle><DialogDescription className="text-white/65">{saved ? "Thank you. Your newsletter request has been saved. No membership account was created." : "Sign up for Motorcar Society news, stories and films. Newsletter signup is separate from Registry membership."}</DialogDescription></DialogHeader>
    {saved ? <Button onClick={dismiss}>Continue browsing</Button> : <><form onSubmit={submit} className="grid gap-4"><fieldset disabled={busy} className="grid gap-4">
      <label className="grid gap-2 text-sm">Name<input name="name" autoComplete="name" required minLength={2} maxLength={120} className="field" /></label>
      <label className="grid gap-2 text-sm">Email address<input name="email" type="email" autoComplete="email" required maxLength={180} className="field" /></label>
      <label className="grid gap-2 text-sm">Phone number (optional)<input name="phone" type="tel" autoComplete="tel" maxLength={50} pattern="[+0-9 ().\-]*" className="field" /></label>
      <div aria-hidden="true" className="absolute -left-[10000px]"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="flex gap-3 text-sm leading-6 text-white/70"><input name="consent" type="checkbox" required className="mt-1 size-4 shrink-0" />I agree to receive the Motorcar Society newsletter. I can request removal through Contact at any time.</label>
      <Button type="submit" className="bg-[var(--gold)] text-black">{busy ? "Saving…" : "Join the newsletter"}</Button>
    </fieldset>{error && <p role="alert" className="text-sm text-red-200">{error}</p>}</form><p className="text-sm leading-6 text-white/70">Interested in the cars? <a href="/signin?mode=register" onClick={remember} className="text-[var(--gold-light)] underline">Request Registry membership</a> or <a href="/signin" onClick={remember} className="underline">sign in</a>.</p><button type="button" onClick={dismiss} className="text-sm text-white/65 underline">Cancel — continue browsing</button></>}
  </DialogContent></Dialog>;
}
