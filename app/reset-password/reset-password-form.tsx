"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) { setMessage("The passwords do not match."); return; }
    setSaving(true);
    setMessage("");
    const { error } = await createClient().auth.updateUser({ password });
    setSaving(false);
    if (error) { setMessage(error.message); return; }
    setComplete(true);
    setMessage("Your password has been updated.");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#101211] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#181a19] p-7 sm:p-9">
        <img src="/motorcar-society-mark.png" alt="Motorcar Society" className="mb-7 h-14 w-14 object-contain" />
        <p className="eyebrow">Secure account access</p>
        <h1 className="mt-4 font-display text-4xl">Choose a new password</h1>
        <p className="mt-4 leading-7 text-white/58">Use at least eight characters. Your new password will work immediately.</p>
        {!complete && <form onSubmit={submit} className="mt-7 space-y-5">
          <div><label className="field-label" htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="field mt-2" /></div>
          <div><label className="field-label" htmlFor="confirm-new-password">Confirm new password</label><input id="confirm-new-password" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="field mt-2" /></div>
          <button disabled={saving} className="min-h-14 w-full rounded-lg bg-[var(--gold)] px-6 font-semibold text-[#111] disabled:opacity-50">{saving ? "Updating…" : "Update password"}</button>
        </form>}
        {message && <p role="status" className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6">{message}</p>}
        <a href={complete ? "/" : "/signin"} className="mt-5 block text-center text-sm font-semibold text-white/55 transition hover:text-white">{complete ? "Continue to Motorcar Society" : "Return to sign in"}</a>
      </section>
    </main>
  );
}
