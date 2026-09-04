import { LockKeyhole, ShieldCheck } from "lucide-react";

import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";
import MotorcarApp from "./motorcar-app";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getChatGPTUser();
  const signInPath = chatGPTSignInPath("/");

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#101211] px-5 py-12 text-white">
        <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#181a19] p-7 text-center shadow-2xl sm:p-10">
          <div className="mx-auto grid size-16 place-items-center rounded-full border border-[var(--gold)]/50 text-[var(--gold-light)]"><LockKeyhole className="size-7" /></div>
          <p className="mt-7 text-sm font-bold uppercase tracking-[0.17em] text-[var(--gold-light)]">Motorcar Society Private</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Sign in to manage car files.</h1>
          <p className="mx-auto mt-5 max-w-md text-lg leading-8 text-white/62">Car records, seller information, photos, and documents are restricted to approved accounts.</p>
          <a href={signInPath} target="_top" className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-[var(--gold)] px-7 text-base font-bold text-[#111] transition hover:bg-[var(--gold-light)]"><ShieldCheck className="mr-2 size-5" />Sign in with ChatGPT</a>
          <p className="mt-5 text-sm leading-6 text-white/42">Use deank@kirklanddigital.com or deankirkland@me.com.</p>
        </section>
      </main>
    );
  }

  return <MotorcarApp signInPath={signInPath} />;
}
