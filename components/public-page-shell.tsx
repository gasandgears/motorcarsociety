import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  ["/about", "About"],
  ["/", "The Registry"],
  ["/submit-a-car", "Submit a Car"],
  ["/contact", "Contact"],
] as const;

export function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#101211] text-white">
      <header className="border-b border-white/10 bg-[#0d0e0e]">
        <div className="mx-auto flex min-h-[5.25rem] max-w-[90rem] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3" aria-label="Motorcar Society home">
            <img src="/motorcar-society-mark.png" alt="" className="size-11 object-contain" />
            <span><span className="block whitespace-nowrap font-display text-lg leading-none tracking-[.04em]">MOTORCAR SOCIETY</span><span className="mt-1.5 block text-[.68rem] font-semibold tracking-[.22em] text-[var(--gold-light)]">PRIVATE REGISTRY</span></span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-3 text-sm text-white/68" aria-label="Public navigation">
            {links.map(([href, label]) => <Link key={href} href={href} className="transition hover:text-white">{label}</Link>)}
            <Link href="/signin" className="rounded-lg border border-white/20 px-4 py-2.5 font-semibold text-white transition hover:bg-white hover:text-black">Member Sign In</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-white/10 bg-[#0d0e0e] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[90rem] flex-col justify-between gap-7 text-sm text-white/45 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Motorcar Society Private Registry</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Legal and contact">
            <Link href="/about" className="hover:text-white">About</Link><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link><Link href="/contact" className="hover:text-white">Contact</Link><Link href="/submit-a-car" className="hover:text-white">Submit a Car</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function PublicHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return <section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(194,160,102,.12),transparent_38%)] px-5 py-20 sm:px-8 sm:py-28 lg:px-12"><div className="mx-auto max-w-[90rem]"><p className="eyebrow">{eyebrow}</p><h1 className="mt-5 max-w-4xl font-display text-5xl leading-[.94] sm:text-7xl">{title}</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/65 sm:text-xl">{intro}</p></div></section>;
}

export function ProseSection({ children }: { children: ReactNode }) {
  return <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12"><div className="mx-auto max-w-5xl text-base leading-8 text-white/65 [&_a]:text-[var(--gold-light)] [&_h2]:mt-14 [&_h2]:font-display [&_h2]:text-4xl [&_h2]:font-normal [&_h2]:text-white [&_h3]:mt-9 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_li]:mt-2 [&_p]:mt-5 [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-6">{children}</div></section>;
}
