"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "register";

function friendlyError(message: string) {
  if (/invalid login credentials/i.test(message)) return "The email or password is incorrect.";
  if (/already registered|already been registered/i.test(message)) return "An account already exists for this email. Choose Sign in instead.";
  if (/password should be at least/i.test(message)) return "Use a password with at least 8 characters.";
  return message;
}

export default function SignInForm({ returnTo, initialMode = "signin" }: { returnTo: string; initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const changeMode = (next: Mode) => {
    setMode(next);
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "register" && password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }
    setSending(true);
    setMessage("");
    const supabase = createClient();
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: email.trim().split("@")[0] } },
        });
    if (result.error) {
      setMessage(friendlyError(result.error.message));
      setSending(false);
      return;
    }
    await fetch("/api/me", { cache: "no-store" });
    window.location.assign(returnTo);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#101211] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#181a19] p-7 sm:p-9">
        <p className="eyebrow">Motorcar Society</p>
        <h1 className="mt-4 font-display text-4xl">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
        <p className="mt-4 leading-7 text-white/58">
          {mode === "signin"
            ? "Enter your email and password. You’ll remain signed in on this device until you choose Sign out."
            : "Create a basic account. Dean or Barnaby will review it and assign your membership access."}
        </p>
        <div className="mt-7 grid grid-cols-2 rounded-lg border border-white/10 bg-black/20 p-1" aria-label="Account access">
          <button type="button" onClick={() => changeMode("signin")} className={`min-h-11 rounded-md text-sm font-semibold transition ${mode === "signin" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>Sign in</button>
          <button type="button" onClick={() => changeMode("register")} className={`min-h-11 rounded-md text-sm font-semibold transition ${mode === "register" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>Create account</button>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <div>
            <label className="field-label" htmlFor="signin-email">Email address</label>
            <input id="signin-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="field mt-2" placeholder="you@example.com" />
          </div>
          <div>
            <label className="field-label" htmlFor="signin-password">Password</label>
            <input id="signin-password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="field mt-2" placeholder="At least 8 characters" />
          </div>
          {mode === "register" && <div>
            <label className="field-label" htmlFor="confirm-password">Confirm password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="field mt-2" placeholder="Enter your password again" />
          </div>}
          <button disabled={sending} className="min-h-14 w-full rounded-lg bg-[var(--gold)] px-6 font-semibold text-[#111] disabled:opacity-50">{sending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create basic account"}</button>
        </form>
        {message && <p role="alert" className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6">{message}</p>}
        <a href="/" className="mt-5 block text-center text-sm font-semibold text-white/50 transition hover:text-white">Return to the Registry</a>
      </section>
    </main>
  );
}
