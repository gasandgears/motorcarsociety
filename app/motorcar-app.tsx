"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Camera,
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Copy,
  FileCheck2,
  FileText,
  FolderOpen,
  Gauge,
  ListChecks,
  LockKeyhole,
  Menu,
  Mail,
  Pause,
  Phone,
  Play,
  Search,
  Share2,
  ShieldCheck,
  Trash2,
  Upload,
  UserRoundCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

type View = "registry" | "vehicle" | "wanted" | "desk" | "intake" | "membership" | "admin";
type AdminSection = "dossier-requests" | "contacts" | "wanted-list" | "registry-releases" | "accounts";

const SHORT_DESCRIPTION_LIMIT = 449;
const LONG_DESCRIPTION_GUIDE = 5500;
const SOCIETY_HERO_IMAGES = [
  { src: "/society-hero-original.jpg", alt: "Black competition sports car in the Motorcar Society gallery" },
  { src: "/society-hero-european-gt.jpg", alt: "Burgundy European grand touring coupe in the Motorcar Society gallery" },
  { src: "/society-hero-european-roadster.jpg", alt: "Silver European roadster in the Motorcar Society gallery" },
  { src: "/society-hero-european-coupe.jpg", alt: "Green European sports coupe in the Motorcar Society gallery" },
  { src: "/society-hero-american-fastback.jpg", alt: "Blue American fastback in the Motorcar Society gallery" },
  { src: "/society-hero-american-convertible.jpg", alt: "Ivory American convertible in the Motorcar Society gallery" },
  { src: "/society-hero-american-competition.jpg", alt: "Black American competition coupe in the Motorcar Society gallery" },
];

type MemberAccount = {
  userId: string;
  email: string;
  displayName: string;
  phone: string;
  location: string;
  collectionNotes: string;
  role: "applicant" | "member" | "barnaby" | "admin";
  tier: "none" | "standard" | "priority" | "private" | "staff" | "leadership";
  status: "pending" | "approved" | "denied";
  createdAt: number;
  updatedAt: number;
};

type RegistryCar = { id: string; year: string; make: string; model: string; detail: string; expectedPrice: string; visibility: string; status: string; category: string; registryId: string; updatedAt: number; heroImageUrl?: string };

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <img src="/motorcar-society-mark.png" alt="" className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11" />
      <div className="min-w-0 text-left">
        <div className="whitespace-nowrap font-display text-base leading-none tracking-[0.03em] sm:text-[1.15rem] sm:tracking-[0.04em]">MOTORCAR SOCIETY</div>
        <div className="mt-1.5 whitespace-nowrap text-[0.62rem] font-semibold tracking-[0.18em] text-[var(--gold-light)] sm:text-[0.72rem] sm:tracking-[0.23em]">PRIVATE REGISTRY</div>
      </div>
    </div>
  );
}

function Header({ view, setView, canAccessDesk, canAccessAdmin, userEmail, signInPath }: { view: View; setView: (view: View) => void; canAccessDesk: boolean; canAccessAdmin: boolean; userEmail: string | null; signInPath: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links: { id: View; label: string }[] = [
    { id: "registry", label: "The Registry" },
    ...(!canAccessDesk && !canAccessAdmin ? [{ id: "wanted" as View, label: "Wanted List" }] : []),
    ...(canAccessDesk ? [{ id: "desk" as View, label: "Barnaby’s Desk" }] : []),
    ...(canAccessAdmin ? [{ id: "admin" as View, label: "Admin Console" }] : []),
  ];

  const selectView = (next: View) => {
    if (next === "admin") window.history.pushState({}, "", "/admin/dossier-requests");
    else if (window.location.pathname.startsWith("/admin/")) window.history.pushState({}, "", "/");
    setView(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(13,14,14,0.94)] backdrop-blur-xl">
      <div className="mx-auto flex h-[5.25rem] max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
        <button onClick={() => selectView("registry")} aria-label="Open the Registry"><Brand /></button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Button
              key={link.id}
              variant="ghost"
              onClick={() => selectView(link.id)}
              className={`h-11 px-5 text-[0.95rem] ${view === link.id ? "bg-white/8 text-white" : "text-white/68 hover:bg-white/6 hover:text-white"}`}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        {userEmail ? (
          <Button variant="outline" onClick={() => selectView("membership")} className="hidden h-11 border-white/20 bg-transparent px-5 text-white hover:bg-white hover:text-black lg:inline-flex">My Account</Button>
        ) : (
          <a href={signInPath} target="_top" className="hidden min-h-11 items-center rounded-md border border-white/20 px-5 text-[0.95rem] font-semibold text-white transition hover:bg-white hover:text-black lg:inline-flex">Member Sign In</a>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 text-white lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Open navigation"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 px-5 py-4 lg:hidden">
          <nav className="grid gap-2" aria-label="Mobile navigation">
            {links.map((link) => (
              <Button key={link.id} variant="ghost" onClick={() => selectView(link.id)} className="h-13 justify-between px-3 text-base text-white">
                {link.label}<ChevronRight className="size-5" />
              </Button>
            ))}
            {userEmail ? (
              <Button variant="ghost" onClick={() => selectView("membership")} className="h-13 justify-between px-3 text-base text-white">
                My Account<ChevronRight className="size-5" />
              </Button>
            ) : (
              <a href={signInPath} target="_top" className="mt-2 inline-flex min-h-13 items-center justify-between rounded-lg bg-[var(--gold)] px-4 text-base font-semibold text-[#111]">
                Member Sign In<ArrowRight className="size-5" />
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function Landing({ signInPath }: { signInPath: string }) {
  return (
    <main className="bg-[#101211] text-white">
      <section className="relative min-h-[calc(100vh-5.25rem)] overflow-hidden border-b border-white/10">
        <img src="/society-hero-original.jpg" alt="A significant competition motorcar in a private collection" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,9,.98)_0%,rgba(8,9,9,.9)_38%,rgba(8,9,9,.3)_72%,rgba(8,9,9,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,9,9,.92)_0%,transparent_42%)]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-5.25rem)] max-w-[90rem] items-center px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-[47rem]">
            <p className="eyebrow">A private society for meaningful motorcars</p>
            <h1 className="mt-6 font-display text-[clamp(3.5rem,7.6vw,7.5rem)] leading-[.88] tracking-[-.035em]">The right car.<span className="mt-2 block text-[.62em] text-white/82">The right next owner.</span></h1>
            <p className="mt-8 max-w-[42rem] text-lg leading-8 text-white/72 sm:text-xl">Motorcar Society was created for collectors who value provenance, discretion and lasting stewardship—not crowded marketplaces. Every Registry car is presented with context, documentation and a direct path to a thoughtful conversation.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href={`${signInPath}${signInPath.includes("?") ? "&" : "?"}mode=register`} className="inline-flex min-h-14 items-center justify-center rounded-lg bg-[var(--gold)] px-7 font-semibold text-[#111] transition hover:bg-[var(--gold-light)]">Request membership<ArrowRight className="ml-2 size-5" /></a>
              <a href={signInPath} className="inline-flex min-h-14 items-center justify-center rounded-lg border border-white/22 px-7 font-semibold transition hover:bg-white hover:text-black">Member sign in</a>
            </div>
            <div className="mt-12 grid max-w-[42rem] gap-5 border-t border-white/15 pt-7 sm:grid-cols-3">
              <div><p className="font-display text-2xl">Curated</p><p className="mt-1 text-sm leading-6 text-white/48">Cars selected for significance, quality and story.</p></div>
              <div><p className="font-display text-2xl">Documented</p><p className="mt-1 text-sm leading-6 text-white/48">Private records organized into a lasting dossier.</p></div>
              <div><p className="font-display text-2xl">Connected</p><p className="mt-1 text-sm leading-6 text-white/48">Wanted Lists quietly match cars with collectors.</p></div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#e9e5dc] px-5 py-20 text-[#171918] sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
          <div><p className="text-sm font-bold uppercase tracking-[.18em] text-[#806c49]">Why it exists</p><h2 className="mt-5 font-display text-5xl leading-[.96] sm:text-6xl">Great cars deserve more than a listing.</h2></div>
          <div className="space-y-7 text-lg leading-8 text-black/62"><p>The best motorcars often change hands through trust, timing and relationships. Motorcar Society gives those exchanges a considered home: a private Registry where the car’s identity, condition, history and supporting material stay together.</p><p>Members can maintain a private Wanted List, discover Registry releases suited to their collection and request deeper access when a car matters to them. Owners gain a discreet, organized presentation for qualified collectors.</p><a href={`${signInPath}${signInPath.includes("?") ? "&" : "?"}mode=register`} className="inline-flex min-h-13 items-center rounded-lg bg-[#171918] px-6 text-base font-semibold text-white">Become a member<ArrowRight className="ml-2 size-5" /></a></div>
        </div>
      </section>
    </main>
  );
}

function Registry({ setView, onOpenCar, showMemberActions = true }: { setView: (view: View) => void; onOpenCar: (id: string) => void; showMemberActions?: boolean }) {
  const [registryCars, setRegistryCars] = useState<RegistryCar[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  useEffect(() => {
    if (heroPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setHeroIndex((current) => (current + 1) % SOCIETY_HERO_IMAGES.length), 6500);
    return () => window.clearInterval(timer);
  }, [heroPaused]);
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ page: String(page) });
    if (search.trim()) query.set("search", search.trim());
    if (category !== "All") query.set("category", category);
    fetch(`/api/registry?${query}`, { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { cars?: RegistryCar[]; categories?: string[]; pageCount?: number; total?: number };
      if (active && response.ok) { setRegistryCars(payload.cars || []); setCategories(payload.categories || []); setPageCount(payload.pageCount || 1); setTotal(payload.total || 0); }
    }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, category, page]);
  const cards = registryCars.map((car) => ({
    id: car.id,
    year: car.year,
    name: `${car.make} ${car.model}`.trim() || "Confidential motorcar",
    detail: car.detail || (car.expectedPrice ? `Guidance ${car.expectedPrice}` : "Private details available"),
    status: car.status === "released" ? (car.visibility === "public" ? "Available" : "Member Preview") : "Internal Review",
    category: car.category,
    registryId: car.registryId,
    heroImageUrl: car.heroImageUrl,
    code: (car.make || car.model || "M").charAt(0).toUpperCase(),
  }));
  return (
    <main>
      <section className="relative min-h-[42rem] overflow-hidden border-b border-white/10 lg:min-h-[46rem]">
        {SOCIETY_HERO_IMAGES.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={index === heroIndex ? image.alt : ""}
            aria-hidden={index !== heroIndex}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "low"}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-[63%_center] transition-[opacity,transform] duration-[1800ms] ease-out motion-reduce:transition-none ${index === heroIndex ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,8,8,0.97)_0%,rgba(7,8,8,0.85)_31%,rgba(7,8,8,0.23)_64%,rgba(7,8,8,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,8,8,0.88)_0%,transparent_35%)]" />

        <div className="relative mx-auto flex min-h-[42rem] max-w-[90rem] items-end px-5 pb-10 pt-28 sm:px-8 lg:min-h-[46rem] lg:items-center lg:px-12 lg:pb-0 lg:pt-0">
          <div className="max-w-[38rem]">
            <div className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold-light)]">
              <span className="h-px w-10 bg-[var(--gold)]" />The Motorcar Society
            </div>
            <h1 className="max-w-[42rem] font-display text-[clamp(3.1rem,6.2vw,6.2rem)] leading-[0.9] tracking-[-0.025em] text-white">
              Remarkable cars.
              <span className="mt-2 block text-[0.62em] leading-[1.02] text-white/95">Their stories, preserved.</span>
            </h1>
            <p className="mt-7 max-w-[34rem] text-lg leading-8 text-white/76 sm:text-xl">
              A private community built around provenance, trusted relationships and the collector cars that deserve to be remembered properly.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => document.getElementById("registry-list")?.scrollIntoView({ behavior: "smooth" })} className="h-14 bg-[var(--gold)] px-7 text-base font-semibold text-[#111] hover:bg-[var(--gold-light)]">
                Explore the Registry<ArrowRight className="ml-2 size-5" />
              </Button>
              {showMemberActions && <Button
                variant="outline"
                onClick={() => setView("membership")}
                className="h-14 border-white/24 bg-black/20 px-7 text-base text-white hover:bg-white hover:text-black"
              >
                Membership
              </Button>}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden items-center gap-2 sm:flex" aria-label="Choose hero image">
          <button onClick={() => setHeroPaused((paused) => !paused)} aria-label={heroPaused ? "Play rotating hero images" : "Pause rotating hero images"} aria-pressed={heroPaused} className="mr-2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/35 text-white/75 backdrop-blur-sm transition hover:bg-black/65 hover:text-white">
            {heroPaused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
          </button>
          {SOCIETY_HERO_IMAGES.map((image, index) => (
            <button key={image.src} onClick={() => setHeroIndex(index)} aria-label={`Show image ${index + 1} of ${SOCIETY_HERO_IMAGES.length}`} aria-current={index === heroIndex} className={`h-1 rounded-full transition-all ${index === heroIndex ? "w-10 bg-[var(--gold-light)]" : "w-5 bg-white/35 hover:bg-white/65"}`} />
          ))}
        </div>
      </section>

      <section id="registry-list" className="scroll-mt-24 border-b border-white/10 bg-[#101211] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[90rem]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="eyebrow">Recently entered</p><h2 className="mt-3 font-display text-4xl text-white sm:text-5xl">The Registry</h2></div>
            <p className="text-sm text-white/48">{total} vehicle{total === 1 ? "" : "s"}</p>
          </div>

          <div className="mt-8 grid gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 md:grid-cols-[minmax(0,1fr)_17rem]">
            <label className="relative"><span className="sr-only">Search the Registry</span><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/38" /><input value={search} onChange={(event) => { setLoading(true); setSearch(event.target.value); setPage(1); }} className="field min-h-12 pl-12" placeholder="Search year, make, model or Registry ID" /></label>
            <label><span className="sr-only">Filter by category</span><NativeSelect value={category} onChange={(event) => { setLoading(true); setCategory(event.target.value); setPage(1); }} className="h-12 w-full border-white/15 bg-[#181a19] text-white"><NativeSelectOption value="All">All categories</NativeSelectOption>{categories.filter((item) => item !== "Uncategorized").map((item) => <NativeSelectOption key={item} value={item}>{item}</NativeSelectOption>)}<NativeSelectOption value="Uncategorized">Uncategorized</NativeSelectOption></NativeSelect></label>
          </div>

          {loading ? <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-lg bg-white/5" />)}</div> : cards.length ? <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
            {cards.map((car) => (
              <a
                key={car.id}
                href={`/registry/${car.id}`}
                onClick={(event) => { event.preventDefault(); onOpenCar(car.id); }}
                className="group min-h-44 overflow-hidden rounded-lg border border-white/10 bg-[#181a19] text-left transition hover:border-[var(--gold)]/65 hover:bg-[#1d1f1e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)]"
              >
                <div className="relative flex h-20 items-center justify-between overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_20%_0%,rgba(179,154,104,0.15),transparent_58%)] px-4">
                  {car.heroImageUrl ? <><img src={car.heroImageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full scale-[1.03] object-cover saturate-[.78] contrast-[1.08] brightness-[.72] transition duration-700 group-hover:scale-100 group-hover:brightness-[.82]" /><span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,8,8,.72),transparent_55%,rgba(7,8,8,.2))]" /></> : <span className="font-display text-4xl text-white/[0.08]">{car.code}</span>}
                  <span className="rounded-full border border-white/14 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/60">{car.status}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold tracking-[0.12em] text-[var(--gold-light)]">{car.year}</p><span className="truncate text-[0.65rem] text-white/35">{car.category}</span></div>
                  <h3 className="mt-1.5 line-clamp-2 font-display text-[1.25rem] leading-tight text-white">{car.name}</h3>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/56">
                    <span className="truncate">{car.detail}</span><ChevronRight className="size-4 shrink-0 transition group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                </div>
                <p className="px-4 pb-3 text-[0.56rem] font-semibold uppercase tracking-[0.09em] text-white/30">{car.registryId}</p>
              </a>
            ))}
          </div> : <div className="mt-9 rounded-xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center"><h3 className="font-display text-3xl text-white">No vehicles found</h3><p className="mt-3 text-white/48">Try a different search or category.</p></div>}
          {pageCount > 1 && <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Registry pages"><Button variant="outline" disabled={page <= 1} onClick={() => { setLoading(true); setPage((current) => current - 1); window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "smooth" }); }} className="border-white/16 bg-transparent text-white hover:bg-white hover:text-black"><ChevronLeft className="mr-2 size-4" />Previous</Button><span className="text-sm text-white/52">Page {page} of {pageCount}</span><Button variant="outline" disabled={page >= pageCount} onClick={() => { setLoading(true); setPage((current) => current + 1); window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "smooth" }); }} className="border-white/16 bg-transparent text-white hover:bg-white hover:text-black">Next<ChevronRight className="ml-2 size-4" /></Button></nav>}
        </div>
      </section>

      {showMemberActions && <section className="bg-[#e9e5dc] px-5 py-16 text-[#171918] sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <p className="eyebrow text-[#756242]">The advantage</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl leading-[1.03] sm:text-5xl">Tell us what belongs in your collection.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/66">
              Members build a private Wanted List. When the right car enters the Registry, the right collectors hear about it first.
            </p>
            <Button onClick={() => setView("wanted")} className="mt-8 h-13 bg-[#191b1a] px-6 text-base text-white hover:bg-[#323533]">
              Build Your Wanted List <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { number: "01", title: "State your interests", copy: "Marque, era, value and exact models." },
              { number: "02", title: "Receive a private match", copy: "The most relevant cars reach you first." },
              { number: "03", title: "Speak directly", copy: "No public bidding or online theater." },
            ].map((item) => (
              <div key={item.number} className="rounded-xl border border-black/12 bg-white/48 p-6">
                <div className="font-display text-4xl text-[#8c754c]">{item.number}</div>
                <h3 className="mt-7 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-6 text-black/58">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>}
    </main>
  );
}

type RegistryVehicleData = {
  id: string;
  year: string;
  make: string;
  model: string;
  location: string;
  expectedPrice: string;
  notes: string;
  visibility: string;
  status: string;
  exteriorColor: string;
  interiorColor: string;
  mileage: string;
  bodyStyle: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  registryId: string;
  category: string;
  shortDescription: string;
  overview: string;
  highlights: string;
  conditionSummary: string;
  provenance: string;
  restorationSummary: string;
};

function RegistryVehicle({ carId, userEmail, signInPath, onBack }: { carId: string; userEmail: string | null; signInPath: string; onBack: () => void }) {
  const [car, setCar] = useState<RegistryVehicleData | null>(null);
  const [photos, setPhotos] = useState<{ id: string; filename: string; url: string }[]>([]);
  const [videos, setVideos] = useState<{ id: string; filename: string; url: string }[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareNote, setShareNote] = useState("I thought you might like this car in the Motorcar Society Private Registry.");
  const [linkCopied, setLinkCopied] = useState(false);
  const numericPrice = Number(car?.expectedPrice?.replace(/[$,\s]/g, ""));
  const priceGuidance = car?.expectedPrice && Number.isFinite(numericPrice) ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(numericPrice) : car?.expectedPrice || "On request";
  const highlights = car?.highlights.split("\n").map((item) => item.replace(/^[-•]\s*/, "").trim()).filter(Boolean) || [];
  const specifications = car ? [
    ["Exterior", car.exteriorColor], ["Interior", car.interiorColor], ["Mileage", car.mileage],
    ["Body style", car.bodyStyle], ["Engine", car.engine], ["Transmission", car.transmission],
    ["Drivetrain", car.drivetrain], ["Registry ID", car.registryId],
  ].filter(([, value]) => value) : [];
  const showPreviousPhoto = () => setActivePhoto((current) => (current - 1 + photos.length) % photos.length);
  const showNextPhoto = () => setActivePhoto((current) => (current + 1) % photos.length);

  useEffect(() => {
    let active = true;
    fetch(`/api/registry/${carId}`, { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { car?: RegistryVehicleData; photos?: { id: string; filename: string; url: string }[]; videos?: { id: string; filename: string; url: string }[]; error?: string };
      if (!response.ok || !payload.car) throw new Error(payload.error || "This vehicle could not be opened.");
      if (active) { setCar(payload.car); setPhotos(payload.photos || []); setVideos(payload.videos || []); }
    }).catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "This vehicle could not be opened."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [carId]);

  const requestDossier = async () => {
    setRequesting(true); setError("");
    try {
      const response = await fetch("/api/dossier-requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ carId }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Your request could not be saved.");
      setRequested(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Your request could not be saved."); }
    finally { setRequesting(false); }
  };
  const shareUrl = `https://motorcarsociety.vercel.app/registry/${carId}`;
  const emailSubject = `A Motorcar Society car for you: ${car?.year || ""} ${car?.make || ""} ${car?.model || ""}`.trim();
  const emailBody = `${shareNote}\n\nView the car here:\n${shareUrl}\n\nYou will need to sign in or create a basic account to view this private Registry car.`;
  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 2500);
  };

  if (loading) return <main className="min-h-[calc(100vh-5.25rem)] bg-[#101211] px-5 py-14 text-white sm:px-8 lg:px-12"><div className="mx-auto h-[38rem] max-w-[90rem] animate-pulse rounded-2xl bg-white/5" /></main>;
  if (!car) return <main className="grid min-h-[calc(100vh-5.25rem)] place-items-center bg-[#101211] px-5 text-white"><div className="max-w-lg text-center"><h1 className="font-display text-4xl">Vehicle unavailable</h1><p className="mt-4 text-white/60">{error}</p><Button onClick={onBack} className="mt-7 bg-[var(--gold)] text-black">Return to the Registry</Button></div></main>;

  return (
    <main className="min-h-[calc(100vh-5.25rem)] overflow-x-hidden bg-[#101211] text-white">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12">
        <Button variant="ghost" onClick={onBack} className="mb-7 px-0 text-white/62 hover:bg-transparent hover:text-white"><ArrowLeft className="mr-2 size-5" />The Registry</Button>
        <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(23rem,0.55fr)]">
          <section className="min-w-0 max-w-full">
            <div className="relative aspect-[4/3] max-h-[68svh] w-full max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#181a19] sm:aspect-[16/10] sm:rounded-2xl">
              {photos[activePhoto] ? <img src={photos[activePhoto].url} alt={`${car.year} ${car.make} ${car.model}`} className="block h-full max-h-full w-full max-w-full object-cover" /> : <div className="grid h-full place-items-center"><Camera className="size-12 text-[var(--gold-light)]" /></div>}
              {photos.length > 1 && <>
                <button type="button" onClick={showPreviousPhoto} aria-label="Show previous photo" className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)] sm:left-5 sm:size-14"><ChevronLeft className="size-7 sm:size-8" /></button>
                <button type="button" onClick={showNextPhoto} aria-label="Show next photo" className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)] sm:right-5 sm:size-14"><ChevronRight className="size-7 sm:size-8" /></button>
              </>}
              <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-4 py-2 text-sm backdrop-blur">{photos.length ? `${activePhoto + 1} / ${photos.length}` : "Private imagery pending"}</div>
            </div>
            {photos.length > 1 && <div className="mt-3 flex w-full max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-2 sm:mt-4 sm:gap-3 scrollbar-thin">{photos.slice(0, 18).map((photo, index) => <button key={photo.id} onClick={() => setActivePhoto(index)} aria-label={`View photo ${index + 1}`} className={`h-16 w-[5.5rem] shrink-0 overflow-hidden rounded-lg border sm:h-20 sm:w-28 ${index === activePhoto ? "border-[var(--gold-light)]" : "border-white/10"}`}><img src={photo.url} alt="" className="block h-full w-full object-cover" /></button>)}</div>}
            {videos.length > 0 && <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--gold-light)]">Vehicle video</p>
              <div className="mt-3 flex flex-wrap gap-3">{videos.map((video, index) => <button key={video.id} type="button" onClick={() => setActiveVideo(activeVideo === video.id ? null : video.id)} className={`group flex min-h-16 items-center gap-3 rounded-xl border px-4 text-left transition ${activeVideo === video.id ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-white/12 bg-white/[.035] hover:border-white/28"}`}><span className="grid size-10 place-items-center rounded-full bg-[var(--gold)] text-[#111]"><Play className="ml-0.5 size-5 fill-current" /></span><span><span className="block text-sm font-semibold">{videos.length === 1 ? "Play vehicle video" : `Play video ${index + 1}`}</span><span className="mt-1 block max-w-56 truncate text-xs text-white/45">{video.filename}</span></span></button>)}</div>
              {activeVideo && <div className="mt-5 aspect-video max-h-[68svh] w-full max-w-full overflow-hidden rounded-xl border border-white/10 bg-black sm:aspect-[16/10] sm:rounded-2xl"><video key={activeVideo} controls autoPlay playsInline preload="metadata" className="block h-full max-h-full w-full max-w-full object-contain"><source src={videos.find((video) => video.id === activeVideo)?.url} /></video></div>}
            </div>}
          </section>
          <aside className="xl:sticky xl:top-32 xl:self-start">
            <p className="eyebrow">Motorcar Society Registry</p>
            <h1 className="mt-4 font-display text-4xl leading-[0.95] sm:text-6xl">{car.year}<span className="mt-3 block text-[0.58em] leading-tight sm:text-[0.55em]">{car.make} {car.model}</span></h1>
            <div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-4 py-2 text-sm font-semibold text-[var(--gold-light)]">Registry release</span>{car.category && car.category !== "Uncategorized" && <span className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/62">{car.category}</span>}{car.location && <span className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/62">{car.location}</span>}</div>
            <div className="mt-6 whitespace-pre-line text-base leading-7 text-white/67 sm:mt-7 sm:text-lg sm:leading-8">{car.shortDescription || car.notes || "Detailed ownership, condition and provenance information is available in the private dossier."}</div>
            <dl className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><dt className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">Guidance</dt><dd className="mt-2 font-display text-2xl">{priceGuidance}</dd></div><div className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><dt className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">Gallery</dt><dd className="mt-2 font-display text-2xl">{photos.length} photos</dd></div></dl>
            {error && <p className="mt-5 rounded-lg border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}
            {userEmail ? <Button disabled={requesting || requested} onClick={() => void requestDossier()} className="mt-7 h-14 w-full bg-[var(--gold)] text-base font-semibold text-[#111] hover:bg-[var(--gold-light)]">{requesting ? "Sending request…" : requested ? "Dossier requested" : "Request Private Dossier"}{requested ? <Check className="ml-2 size-5" /> : <ArrowRight className="ml-2 size-5" />}</Button> : <a href={signInPath} target="_top" className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-[var(--gold)] px-6 font-semibold text-[#111]">Sign in to request dossier<ArrowRight className="ml-2 size-5" /></a>}
            {userEmail && <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="mt-3 h-14 w-full border-white/18 bg-transparent text-base text-white hover:bg-white hover:text-black"><Share2 className="mr-2 size-5" />Share this car</Button></DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto border-white/12 bg-[#171918] p-6 text-white sm:max-w-lg sm:p-8">
                <DialogHeader><DialogTitle className="font-display text-4xl font-normal">Share this car</DialogTitle><DialogDescription className="mt-2 text-base leading-7 text-white/60">Send the private car page to someone you think may like it.</DialogDescription></DialogHeader>
                <ol className="mt-6 space-y-3">
                  {["Enter their email address.", "Add a short note if you want.", "Press Open email, then press Send in your email app."].map((instruction, index) => <li key={instruction} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--gold)] font-bold text-[#111]">{index + 1}</span><span className="text-sm font-semibold">{instruction}</span></li>)}
                </ol>
                <div className="mt-6 space-y-5">
                  <div><label className="field-label" htmlFor="share-email">Their email address</label><input id="share-email" type="email" value={shareEmail} onChange={(event) => setShareEmail(event.target.value)} className="field mt-2" placeholder="friend@example.com" /></div>
                  <div><label className="field-label" htmlFor="share-note">Your note</label><textarea id="share-note" value={shareNote} onChange={(event) => setShareNote(event.target.value)} className="field mt-2 min-h-28 resize-y" /></div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-white/40">Important</p><p className="mt-2 text-sm leading-6 text-white/65">They must sign in or create an account before they can see the car. New accounts wait for approval.</p></div>
                </div>
                <DialogFooter className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Button type="button" variant="outline" onClick={() => void copyShareLink()} className="h-13 border-white/18 bg-transparent text-white hover:bg-white hover:text-black">{linkCopied ? <Check className="mr-2 size-5" /> : <Copy className="mr-2 size-5" />}{linkCopied ? "Link copied" : "Copy link"}</Button>
                  <a href={`mailto:${encodeURIComponent(shareEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`} className={`inline-flex min-h-13 items-center justify-center rounded-lg bg-[var(--gold)] px-5 font-semibold text-[#111] transition hover:bg-[var(--gold-light)] ${!shareEmail.trim() ? "pointer-events-none opacity-45" : ""}`} aria-disabled={!shareEmail.trim()}><Mail className="mr-2 size-5" />Open email</a>
                </DialogFooter>
              </DialogContent>
            </Dialog>}
            <p className="mt-4 text-center text-sm leading-6 text-white/42">Requests are reviewed personally. Source documents remain restricted to Motorcar Society staff.</p>
          </aside>
        </div>
        <div className="mt-16 border-t border-white/10 pt-12 lg:mt-20 lg:pt-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.65fr)] lg:gap-20">
            <div className="space-y-14">
              {(car.overview || car.notes) && <section aria-labelledby="vehicle-description"><p className="eyebrow">The motorcar</p><h2 id="vehicle-description" className="mt-3 font-display text-4xl sm:text-5xl">Description</h2><p className="mt-6 max-w-4xl whitespace-pre-line text-lg leading-8 text-white/68">{car.overview || car.notes}</p></section>}
              {highlights.length > 0 && <section aria-labelledby="vehicle-highlights"><p className="eyebrow">At a glance</p><h2 id="vehicle-highlights" className="mt-3 font-display text-4xl">Documented highlights</h2><ul className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">{highlights.map((item) => <li key={item} className="flex gap-3 border-t border-white/10 pt-4 text-base leading-7 text-white/72"><Check className="mt-1 size-4 shrink-0 text-[var(--gold-light)]" />{item}</li>)}</ul></section>}
              {car.conditionSummary && <section aria-labelledby="vehicle-condition"><p className="eyebrow">Inspection record</p><h2 id="vehicle-condition" className="mt-3 font-display text-4xl">Condition</h2><p className="mt-6 whitespace-pre-line text-lg leading-8 text-white/68">{car.conditionSummary}</p></section>}
              {car.restorationSummary && <section aria-labelledby="vehicle-restoration"><p className="eyebrow">Care &amp; preservation</p><h2 id="vehicle-restoration" className="mt-3 font-display text-4xl">Restoration history</h2><p className="mt-6 whitespace-pre-line text-lg leading-8 text-white/68">{car.restorationSummary}</p></section>}
              {car.provenance && <section aria-labelledby="vehicle-provenance"><p className="eyebrow">Recorded history</p><h2 id="vehicle-provenance" className="mt-3 font-display text-4xl">Provenance</h2><p className="mt-6 whitespace-pre-line text-lg leading-8 text-white/68">{car.provenance}</p></section>}
            </div>
            <aside className="space-y-8">
              {specifications.length > 0 && <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-7"><p className="eyebrow">Vehicle details</p><h2 className="mt-3 font-display text-3xl">Specifications</h2><dl className="mt-6">{specifications.map(([label, value]) => <div key={label} className="grid grid-cols-[7rem_1fr] gap-4 border-t border-white/10 py-4 first:border-t-0 first:pt-0"><dt className="text-sm text-white/40">{label}</dt><dd className="text-sm font-semibold leading-6 text-white/82">{value}</dd></div>)}</dl></section>}
              <section className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--gold)]/[0.07] p-6 sm:p-7"><ShieldCheck className="size-7 text-[var(--gold-light)]" /><h2 className="mt-5 font-display text-3xl">Registry documentation</h2><p className="mt-4 leading-7 text-white/60">Ownership, identity, drivetrain, restoration, condition and photo records are retained in the private vehicle file.</p><p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold-light)]">Available by approved dossier request</p></section>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function WantedList({ userEmail, signInPath }: { userEmail: string | null; signInPath: string }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [choices, setChoices] = useState<string[]>([]);
  const [specificCar, setSpecificCar] = useState("");
  const [acquisitionLow, setAcquisitionLow] = useState("");
  const [acquisitionHigh, setAcquisitionHigh] = useState("");
  const [era, setEra] = useState("postwar");
  const [primaryInterest, setPrimaryInterest] = useState("important");

  useEffect(() => {
    if (!userEmail) return;
    let active = true;
    fetch("/api/wanted", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { profile?: { marques: string; specificCar: string; acquisitionLow: string; acquisitionHigh: string; era: string; primaryInterest: string }; error?: string };
        if (!response.ok) throw new Error(payload.error || "Your Wanted List could not be loaded.");
        if (active && payload.profile) {
          setChoices(payload.profile.marques.split("|").filter(Boolean));
          setSpecificCar(payload.profile.specificCar);
          setAcquisitionLow(payload.profile.acquisitionLow || "");
          setAcquisitionHigh(payload.profile.acquisitionHigh || "");
          setEra(payload.profile.era);
          setPrimaryInterest(payload.profile.primaryInterest);
        }
      })
      .catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Your Wanted List could not be loaded."); });
    return () => { active = false; };
  }, [userEmail]);

  const toggle = (choice: string) => {
    setChoices((current) => current.includes(choice) ? current.filter((item) => item !== choice) : [...current, choice]);
    setSaved(false);
  };

  const saveWantedList = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/wanted", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ marques: choices, specificCar, acquisitionLow, acquisitionHigh, era, primaryInterest }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Your Wanted List could not be saved.");
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your Wanted List could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  if (!userEmail) {
    return (
      <main className="grid min-h-[calc(100vh-5.25rem)] place-items-center bg-[#101211] px-5 py-12 text-white">
        <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#181a19] p-7 text-center sm:p-10">
          <LockKeyhole className="mx-auto size-8 text-[var(--gold-light)]" />
          <h1 className="mt-5 font-display text-4xl">Your Wanted List is private.</h1>
          <p className="mt-4 text-lg leading-8 text-white/62">Sign in to create a confidential acquisition profile and receive relevant private matches.</p>
          <a href={signInPath} target="_top" className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-[var(--gold)] px-7 font-semibold text-[#111]">Sign in to continue</a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-5.25rem)] bg-[#101211] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="eyebrow">Private matching profile</p>
          <h1 className="mt-4 font-display text-5xl leading-none text-white sm:text-6xl">Your Wanted List</h1>
          <p className="mt-6 text-lg leading-8 text-white/64">Choose what you actively want to acquire. Your selections remain private and guide every early-access introduction.</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_21rem]">
          <section className="rounded-2xl border border-white/10 bg-[#181a19] p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white">Marques of interest</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {["Aston Martin", "Bugatti", "Duesenberg", "Ferrari", "Jaguar", "Lamborghini", "Mercedes-Benz", "Porsche", "Shelby"].map((choice) => {
                const active = choices.includes(choice);
                return (
                  <button
                    key={choice}
                    onClick={() => toggle(choice)}
                    className={`flex min-h-14 items-center justify-between rounded-lg border px-4 text-left text-[0.95rem] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)] ${active ? "border-[var(--gold)] bg-[var(--gold)]/12 text-white" : "border-white/12 bg-white/[0.025] text-white/68 hover:border-white/28 hover:text-white"}`}
                  >
                    {choice}{active && <Check className="size-5 text-[var(--gold-light)]" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-9 grid gap-7 sm:grid-cols-2">
              <div><label className="block text-base font-semibold text-white" htmlFor="specific-car">Specific car</label><input id="specific-car" value={specificCar} onChange={(event) => { setSpecificCar(event.target.value); setSaved(false); }} className="field mt-3" placeholder="Example: 1967 Ferrari 275 GTB/4" /></div>
              <div>
                <span className="block text-base font-semibold text-white">Acquisition range</span>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div><label className="field-label text-sm" htmlFor="range-low">Low</label><div className="relative mt-2"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">$</span><input id="range-low" inputMode="numeric" value={acquisitionLow} onChange={(event) => { setAcquisitionLow(event.target.value); setSaved(false); }} className="field pl-8" placeholder="250,000" /></div></div>
                  <div><label className="field-label text-sm" htmlFor="range-high">High</label><div className="relative mt-2"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">$</span><input id="range-high" inputMode="numeric" value={acquisitionHigh} onChange={(event) => { setAcquisitionHigh(event.target.value); setSaved(false); }} className="field pl-8" placeholder="750,000" /></div></div>
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-white" htmlFor="era">Preferred era</label>
                <NativeSelect id="era" className="field mt-3" value={era} onChange={(event) => { setEra(event.target.value); setSaved(false); }}>
                  <NativeSelectOption value="prewar">Pre-war</NativeSelectOption><NativeSelectOption value="postwar">1946–1969</NativeSelectOption><NativeSelectOption value="seventies">1970–1989</NativeSelectOption><NativeSelectOption value="modern">1990 and newer</NativeSelectOption><NativeSelectOption value="any">Any era</NativeSelectOption>
                </NativeSelect>
              </div>
              <div>
                <label className="block text-base font-semibold text-white" htmlFor="condition">Primary interest</label>
                <NativeSelect id="condition" className="field mt-3" value={primaryInterest} onChange={(event) => { setPrimaryInterest(event.target.value); setSaved(false); }}>
                  <NativeSelectOption value="important">Historically significant cars</NativeSelectOption><NativeSelectOption value="competition">Competition cars</NativeSelectOption><NativeSelectOption value="preservation">Highly original cars</NativeSelectOption><NativeSelectOption value="concours">Concours-level cars</NativeSelectOption><NativeSelectOption value="any">Any important car</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>

            {error && <p className="mt-6 rounded-lg border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100" role="alert">{error}</p>}
            <Button disabled={saving} onClick={saveWantedList} className="mt-9 h-14 w-full bg-[var(--gold)] text-base font-semibold text-[#111] hover:bg-[var(--gold-light)] sm:w-auto sm:px-8">
              {saved ? <Check className="mr-2 size-5" /> : <ShieldCheck className="mr-2 size-5" />}{saving ? "Saving…" : saved ? "Wanted List Saved" : "Save Private Wanted List"}
            </Button>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[var(--gold)]/35 bg-[var(--gold)]/8 p-6">
              <LockKeyhole className="size-7 text-[var(--gold-light)]" />
              <h2 className="mt-5 text-xl font-semibold text-white">Private by design</h2>
              <p className="mt-3 leading-7 text-white/61">Your interests are visible only to the Motorcar Society sales team.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#181a19] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/45">Current profile</p>
              <div className="mt-5 space-y-4 text-base">
                <div className="flex justify-between gap-3"><span className="text-white/55">Marques</span><span className="text-right text-white">{choices.length || "None"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-white/55">Range</span><span className="text-right text-white">{acquisitionLow || acquisitionHigh ? `${acquisitionLow ? `$${acquisitionLow}` : "Open"} – ${acquisitionHigh ? `$${acquisitionHigh}` : "Open"}` : "Not set"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-white/55">Alert order</span><span className="text-right text-white">Private Match</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

type WantedVehicle = { id: string; year: string; make: string; model: string; variant: string; acquisitionLow: string; acquisitionHigh: string; notes: string; status: string; updatedAt: number };

function WantedVehicleList({ userEmail, signInPath }: { userEmail: string | null; signInPath: string }) {
  const blank = { year: "", make: "", model: "", variant: "", acquisitionLow: "", acquisitionHigh: "", notes: "", status: "active" };
  const [items, setItems] = useState<WantedVehicle[]>([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = async () => { const response = await fetch("/api/wanted", { cache: "no-store" }); const payload = await response.json() as { items?: WantedVehicle[]; error?: string }; if (!response.ok) throw new Error(payload.error || "Your Wanted List could not be loaded."); setItems(payload.items || []); };
  useEffect(() => { if (!userEmail) return; let active = true; fetch("/api/wanted", { cache: "no-store" }).then(async (response) => { const payload = await response.json() as { items?: WantedVehicle[]; error?: string }; if (!response.ok) throw new Error(payload.error || "Your Wanted List could not be loaded."); if (active) setItems(payload.items || []); }).catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Your Wanted List could not be loaded."); }); return () => { active = false; }; }, [userEmail]);
  if (!userEmail) return <main className="grid min-h-[calc(100vh-5.25rem)] place-items-center bg-[#101211] px-5 py-12 text-white"><section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#181a19] p-8 text-center"><LockKeyhole className="mx-auto size-8 text-[var(--gold-light)]" /><h1 className="mt-5 font-display text-4xl">Your Wanted List is private.</h1><p className="mt-4 text-lg leading-8 text-white/62">Sign in to save the individual cars you want Motorcar Society to find.</p><a href={signInPath} target="_top" className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-[var(--gold)] px-7 font-semibold text-[#111]">Sign in to continue</a></section></main>;
  const update = (field: keyof typeof blank, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const save = async () => { setSaving(true); setError(""); try { const response = await fetch("/api/wanted", { method: editingId ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, id: editingId }) }); const payload = await response.json() as { error?: string }; if (!response.ok) throw new Error(payload.error || "The wanted vehicle could not be saved."); await load(); setForm(blank); setEditingId(null); } catch (caught) { setError(caught instanceof Error ? caught.message : "The wanted vehicle could not be saved."); } finally { setSaving(false); } };
  const edit = (item: WantedVehicle) => { setEditingId(item.id); setForm({ year: item.year, make: item.make, model: item.model, variant: item.variant, acquisitionLow: item.acquisitionLow, acquisitionHigh: item.acquisitionHigh, notes: item.notes, status: item.status }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async (item: WantedVehicle) => { if (!window.confirm(`Remove ${[item.year, item.make, item.model].filter(Boolean).join(" ")} from your Wanted List?`)) return; const response = await fetch(`/api/wanted?id=${encodeURIComponent(item.id)}`, { method: "DELETE" }); if (response.ok) await load(); else { const payload = await response.json() as { error?: string }; setError(payload.error || "The wanted vehicle could not be removed."); } };
  const visible = items.filter((item) => [item.year, item.make, item.model, item.variant, item.notes].join(" ").toLowerCase().includes(search.toLowerCase()));
  return <main className="min-h-[calc(100vh-5.25rem)] bg-[#101211] px-5 py-12 text-white sm:px-8 lg:px-12 lg:py-16"><div className="mx-auto max-w-6xl"><p className="eyebrow">Private acquisition requests</p><h1 className="mt-4 font-display text-5xl sm:text-6xl">Your Wanted List</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-white/62">Add one record for every car you are actively seeking. You can update or remove any request whenever your collection plans change.</p>
    <section className="mt-9 rounded-2xl border border-white/10 bg-[#181a19] p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><h2 className="font-display text-3xl">{editingId ? "Update wanted car" : "Add a wanted car"}</h2>{editingId && <button onClick={() => { setEditingId(null); setForm(blank); }} className="text-sm font-semibold text-white/52 hover:text-white">Cancel edit</button>}</div><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><div><label className="field-label" htmlFor="wanted-year">Year or range</label><input id="wanted-year" value={form.year} onChange={(event) => update("year", event.target.value)} className="field mt-2" placeholder="1969–1970" /></div><div><label className="field-label" htmlFor="wanted-make">Make</label><input id="wanted-make" value={form.make} onChange={(event) => update("make", event.target.value)} className="field mt-2" placeholder="Ford" /></div><div><label className="field-label" htmlFor="wanted-model">Model</label><input id="wanted-model" value={form.model} onChange={(event) => update("model", event.target.value)} className="field mt-2" placeholder="Mustang Boss 302" /></div><div><label className="field-label" htmlFor="wanted-variant">Variant / specification</label><input id="wanted-variant" value={form.variant} onChange={(event) => update("variant", event.target.value)} className="field mt-2" placeholder="Grabber Blue, 4-speed" /></div><div className="sm:col-span-2"><span className="field-label">Acquisition range</span><div className="mt-2 grid grid-cols-2 gap-3"><input inputMode="numeric" aria-label="Low acquisition range" value={form.acquisitionLow} onChange={(event) => update("acquisitionLow", event.target.value)} className="field" placeholder="Low" /><input inputMode="numeric" aria-label="High acquisition range" value={form.acquisitionHigh} onChange={(event) => update("acquisitionHigh", event.target.value)} className="field" placeholder="High" /></div></div><div className="sm:col-span-2"><label className="field-label" htmlFor="wanted-notes">Important details</label><input id="wanted-notes" value={form.notes} onChange={(event) => update("notes", event.target.value)} className="field mt-2" placeholder="Original drivetrain, documented history, colors to avoid…" /></div></div>{error && <p className="mt-5 rounded-lg border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}<Button disabled={saving || (!form.make && !form.model)} onClick={() => void save()} className="mt-7 h-13 bg-[var(--gold)] px-7 font-semibold text-[#111] hover:bg-[var(--gold-light)]">{saving ? "Saving…" : editingId ? "Save changes" : "Add to Wanted List"}</Button></section>
    <section className="mt-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Saved requests</p><h2 className="mt-2 font-display text-4xl">Cars you want</h2></div><label className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/35" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="field pl-12" placeholder="Search your Wanted List" /></label></div>{visible.length ? <div className="mt-6 grid gap-4 md:grid-cols-2">{visible.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-[#181a19] p-6"><div className="flex justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.13em] text-[var(--gold-light)]">{item.year || "Any year"}</p><h3 className="mt-2 font-display text-3xl">{item.make} {item.model}</h3>{item.variant && <p className="mt-2 text-white/55">{item.variant}</p>}</div><span className="h-fit rounded-full border border-white/12 px-3 py-1.5 text-xs uppercase text-white/45">{item.status}</span></div><p className="mt-5 text-white/58">{item.acquisitionLow || item.acquisitionHigh ? `$${item.acquisitionLow || "Open"} – $${item.acquisitionHigh || "Open"}` : "Acquisition range open"}</p>{item.notes && <p className="mt-4 leading-7 text-white/55">{item.notes}</p>}<div className="mt-6 flex gap-3 border-t border-white/8 pt-5"><Button variant="outline" onClick={() => edit(item)} className="border-white/16 bg-transparent text-white hover:bg-white hover:text-black">Edit</Button><Button variant="ghost" onClick={() => void remove(item)} className="text-white/45 hover:bg-red-500/10 hover:text-red-200">Remove</Button></div></article>)}</div> : <div className="mt-6 rounded-xl border border-white/10 py-14 text-center text-white/48">{items.length ? "No requests match your search." : "Your list is empty. Add the first car above."}</div>}</section>
  </div></main>;
}

type SavedCarSummary = {
  id: string;
  year: string;
  make: string;
  model: string;
  sellerName: string;
  expectedPrice: string;
  location: string;
  status: string;
  updatedAt: number;
  currentAction: {
    actionKey: string;
    action: string;
    assignedTo: string;
    dueAt: number;
    snoozeCount: number;
    status: "open" | "waiting" | "completed";
    progress: number;
    tone: "urgent" | "warning" | "ready";
  };
};

function deskDueLabel(car: SavedCarSummary, now: number) {
  if (car.currentAction.status === "waiting") return "With Dean";
  if (car.currentAction.status === "completed") return "Complete";
  const difference = car.currentAction.dueAt - now;
  if (difference <= 0) return "Overdue";
  if (difference <= 24 * 60 * 60 * 1000) return "Due today";
  if (difference <= 48 * 60 * 60 * 1000) return "Due tomorrow";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(car.currentAction.dueAt);
}

function BarnabyDesk({ onAddCar, onOpenCar, signInPath }: { onAddCar: () => void; onOpenCar: (id: string) => void; signInPath: string }) {
  const [savedCars, setSavedCars] = useState<SavedCarSummary[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [carsError, setCarsError] = useState("");
  const [actionSaving, setActionSaving] = useState<string | null>(null);
  const [deskNotice, setDeskNotice] = useState("");
  const [deskNow] = useState(() => Date.now());

  const loadDesk = async () => {
    const response = await fetch("/api/desk");
    const data = await response.json() as { cars?: SavedCarSummary[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Barnaby’s action list could not be loaded.");
    setSavedCars(data.cars || []);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/desk")
      .then(async (response) => {
        const data = await response.json() as { cars?: SavedCarSummary[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Barnaby’s action list could not be loaded.");
        if (active) setSavedCars(data.cars || []);
      })
      .catch((error: Error) => { if (active) setCarsError(error.message); })
      .finally(() => { if (active) setCarsLoading(false); });
    return () => { active = false; };
  }, []);

  const updateAction = async (car: SavedCarSummary, operation: "complete" | "snooze") => {
    setActionSaving(car.id);
    setCarsError("");
    setDeskNotice("");
    try {
      const response = await fetch(`/api/cars/${car.id}/task`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskKey: car.currentAction.actionKey, operation }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "The action could not be updated.");
      await loadDesk();
      setDeskNotice(operation === "complete" ? "Action completed. The next item is ready." : "Reminder moved ahead 24 hours.");
    } catch (error) {
      setCarsError(error instanceof Error ? error.message : "The action could not be updated.");
    } finally {
      setActionSaving(null);
    }
  };

  const openCount = savedCars.filter((car) => car.currentAction.status === "open").length;
  const withDeanCount = savedCars.filter((car) => car.currentAction.status === "waiting").length;

  return (
    <main className="min-h-[calc(100vh-5.25rem)] bg-[#e9e5dc] px-5 py-10 text-[#171918] sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#806c49]">Barnaby’s private workspace</p>
            <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Good morning, Barnaby.</h1>
            <p className="mt-5 text-xl text-black/61">{carsLoading ? "Loading today’s work…" : openCount === 0 ? "You are caught up." : `${openCount} car${openCount === 1 ? " needs" : "s need"} your attention. Start with the first one.`}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onAddCar} variant="outline" className="h-12 border-black/15 bg-white/50 px-5 text-base hover:bg-white"><FolderOpen className="mr-2 size-5" /> Add a Car</Button>
            <Button className="h-12 bg-[#1a1c1b] px-5 text-base text-white hover:bg-[#343735]"><Gauge className="mr-2 size-5" /> Pipeline</Button>
          </div>
        </div>

        {deskNotice && <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#60765c]/24 bg-[#60765c]/8 px-4 py-3 text-sm font-semibold text-[#52654e]" role="status"><Check className="size-4" />{deskNotice}</div>}

        {(carsLoading || carsError || savedCars.length > 0) && (
          <section className="mt-9 rounded-2xl border border-black/10 bg-white/65 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#806c49]">Saved inventory</p><h2 className="mt-2 font-display text-3xl">Recent car files</h2></div>
              {!carsLoading && !carsError && <p className="text-sm font-semibold text-black/42">{savedCars.length} saved</p>}
            </div>
            {carsLoading && <div className="mt-5 h-20 animate-pulse rounded-xl bg-black/5" />}
            {carsError && <div className="mt-5 rounded-xl border border-[#8f3329]/20 bg-[#8f3329]/7 p-4 text-[#7a2d25]"><p>{carsError}</p>{/sign in/i.test(carsError) && <a href={signInPath} target="_top" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-[#1a1c1b] px-5 font-semibold text-white hover:bg-[#343735]">Sign in again</a>}</div>}
            {savedCars.length > 0 && (
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {savedCars.slice(0, 6).map((car) => (
                  <button key={car.id} onClick={() => onOpenCar(car.id)} className="flex min-h-24 items-center gap-4 rounded-xl border border-black/10 bg-white p-4 text-left transition hover:border-[#806c49]/65 hover:shadow-sm">
                    <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#806c49]/10 text-[#806c49]"><CarFront className="size-6" /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-display text-xl">{[car.year, car.make, car.model].filter(Boolean).join(" ") || "New motorcar"}</span><span className="mt-1 block truncate text-sm text-black/46">{car.sellerName || "Seller pending"} · {car.expectedPrice || "Price pending"}</span></span>
                    <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#806c49]">Open <ChevronRight className="size-4" /></span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_22rem]">
          <section className="space-y-4">
            {carsLoading && <div className="h-48 animate-pulse rounded-2xl bg-white/60" />}
            {!carsLoading && savedCars.length === 0 && <div className="rounded-2xl border border-black/10 bg-white p-8 text-center"><CarFront className="mx-auto size-9 text-[#806c49]" /><h2 className="mt-4 font-display text-3xl">No car files yet.</h2><p className="mt-2 text-black/52">Add the first car and its next action will appear here.</p><Button onClick={onAddCar} className="mt-6 h-12 bg-[#1a1c1b] px-5 text-white hover:bg-[#343735]">Add a Car</Button></div>}
            {savedCars.map((car) => {
              const action = car.currentAction;
              const done = action.status === "completed";
              const waiting = action.status === "waiting";
              const Icon = action.actionKey === "seller_contact" ? Phone : action.actionKey === "photos" ? Camera : action.actionKey === "dean_review" || done ? ClipboardCheck : ListChecks;
              const due = deskDueLabel(car, deskNow);
              return (
                <article key={car.id} className={`rounded-2xl border bg-white p-5 shadow-[0_12px_36px_rgba(21,23,22,0.06)] sm:p-6 ${done || waiting ? "border-[#71866c]/35" : "border-black/10"}`}>
                  <div className="grid gap-5 lg:grid-cols-[4rem_1fr_15rem] lg:items-center">
                    <div className={`grid size-14 place-items-center rounded-xl ${action.tone === "urgent" ? "bg-[#8f3329]/10 text-[#8f3329]" : action.tone === "warning" ? "bg-[#a67b30]/12 text-[#806022]" : "bg-[#60765c]/12 text-[#556951]"}`}>
                      <Icon className="size-7" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <h2 className="font-display text-[1.7rem] leading-tight">{[car.year, car.make, car.model].filter(Boolean).join(" ") || "New motorcar"}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${action.tone === "urgent" ? "bg-[#8f3329]/10 text-[#8f3329]" : action.tone === "warning" ? "bg-[#a67b30]/12 text-[#79591e]" : "bg-[#60765c]/12 text-[#52654e]"}`}>{due}</span>
                      </div>
                      <p className="mt-2 text-[0.95rem] text-black/48">{car.sellerName || "Seller pending"}{car.location ? ` · ${car.location}` : ""} · Assigned to {action.assignedTo}</p>
                      <p className={`mt-4 text-lg font-semibold ${done ? "line-through" : ""}`}>{action.action}</p>
                      <div className="mt-4 flex items-center gap-3">
                        <Progress value={action.progress} className="h-2 max-w-sm bg-black/8 [&_[data-slot=progress-indicator]]:bg-[#806c49]" />
                        <span className="text-sm font-semibold text-black/45">{action.progress}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 lg:items-stretch">
                      <Button onClick={() => onOpenCar(car.id)} className="h-12 justify-between bg-[#1a1c1b] px-5 text-base text-white hover:bg-[#343735]">Open car file<ArrowRight className="size-5" /></Button>
                      {!done && !waiting && <Button disabled={actionSaving === car.id} variant="outline" onClick={() => void updateAction(car, "complete")} className="h-11 border-black/14 bg-white text-black hover:bg-black/5">{actionSaving === car.id ? "Saving…" : "Mark action complete"}</Button>}
                      {!done && !waiting && <Button disabled={actionSaving === car.id || action.snoozeCount >= 1} variant="ghost" onClick={() => void updateAction(car, "snooze")} className="h-10 text-black/48 hover:bg-black/5 hover:text-black disabled:opacity-45">{action.snoozeCount >= 1 ? "Snooze already used" : "Remind me tomorrow"}</Button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl bg-[#181a19] p-6 text-white">
              <div className="flex items-center justify-between"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/46">Daily guardrail</p><BellRing className="size-5 text-[var(--gold-light)]" /></div>
              <h2 className="mt-5 font-display text-[1.8rem]">The system keeps asking.</h2>
              <div className="mt-6 space-y-4">
                {[["9:00 AM", "Today’s first action"], ["2:00 PM", "Overdue reminder"], ["24 hours", "Dean is alerted"]].map(([time, label]) => (
                  <div key={time} className="flex gap-3 border-b border-white/8 pb-4 last:border-0 last:pb-0">
                    <Clock3 className="mt-0.5 size-5 shrink-0 text-[var(--gold-light)]" />
                    <div><div className="font-semibold">{time}</div><div className="mt-1 text-sm leading-6 text-white/53">{label}</div></div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-[var(--gold)]/26 bg-[var(--gold)]/8 p-4 text-sm leading-6 text-white/67">
                One snooze is allowed. After that, the task stays at the top until completed or reassigned.
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white/60 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/42">Current pipeline</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-4"><div className="font-display text-4xl">{openCount}</div><div className="mt-1 text-sm text-black/52">Open actions</div></div>
                <div className="rounded-lg bg-white p-4"><div className="font-display text-4xl">{withDeanCount}</div><div className="mt-1 text-sm text-black/52">With Dean</div></div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

const intakeSteps = [
  { number: 1, label: "Start the file" },
  { number: 2, label: "Deal details" },
  { number: 3, label: "Photos & records" },
  { number: 4, label: "Handoff" },
];

const fileChecklist = [
  { id: "hero", label: "Listing hero image", help: "One strong exterior image; the Registry applies the cinematic card treatment automatically", accept: "image/*", icon: Camera },
  { id: "photos", label: "Vehicle photography", help: "Exterior, interior, engine bay and detail images", accept: "image/*", icon: Camera },
  { id: "title", label: "Ownership or title evidence", help: "Title evidence or equivalent ownership record", accept: "image/*,application/pdf", icon: FileText },
  { id: "registration", label: "Current registration evidence", help: "Current registration or applicable equivalent", accept: "image/*,application/pdf", icon: FileText },
  { id: "bill_of_sale", label: "Bill of sale or transfer record", help: "Latest purchase or transfer record", accept: "image/*,application/pdf", icon: FileCheck2 },
  { id: "ownership_history", label: "Ownership history", help: "Known owners and chain of custody", accept: "image/*,application/pdf", icon: FolderOpen },
  { id: "identity", label: "Vehicle identity verification", help: "VIN, chassis, data plate and body stampings", accept: "image/*,application/pdf", icon: CarFront },
  { id: "drivetrain", label: "Engine and drivetrain verification", help: "Engine, transmission and axle identification", accept: "image/*,application/pdf", icon: Gauge },
  { id: "restoration_history", label: "Restoration history", help: "Work history, dates and supporting records", accept: "image/*,application/pdf", icon: FolderOpen },
  { id: "restoration_invoice", label: "Restoration invoices", help: "Invoices and receipts supporting completed work", accept: "image/*,application/pdf", icon: FileText },
  { id: "condition", label: "Condition inspection", help: "Current inspection or condition report", accept: "image/*,application/pdf", icon: ClipboardCheck },
  { id: "photo_manifest", label: "Photo documentation manifest", help: "Index of identity and condition photographs", accept: "image/*,application/pdf", icon: Camera },
  { id: "provenance", label: "Provenance narrative", help: "Written history and significance of the vehicle", accept: "image/*,application/pdf", icon: FileText },
  { id: "application", label: "Registry intake application", help: "Completed and signed Registry application", accept: "image/*,application/pdf", icon: FileCheck2 },
  { id: "video", label: "Walkaround video", help: "Optional video from the phone or files", accept: "video/*", icon: Upload },
] as const;

type FileCategory = (typeof fileChecklist)[number]["id"] | "records";

const fileCategoryLabels: Record<FileCategory, string> = {
  hero: "Listing hero image",
  photos: "Photos",
  title: "Ownership / title",
  registration: "Registration",
  bill_of_sale: "Bill of sale",
  ownership_history: "Ownership history",
  identity: "Identity verification",
  drivetrain: "Engine / drivetrain",
  restoration_history: "Restoration history",
  restoration_invoice: "Restoration invoice",
  condition: "Condition inspection",
  photo_manifest: "Photo manifest",
  provenance: "Provenance",
  application: "Registry application",
  video: "Walkaround video",
  records: "Other document",
};

type IntakeUpload = {
  id: string;
  serverId: string | null;
  name: string;
  size: number;
  type: string;
  previewUrl: string | null;
  category: FileCategory;
  status: "uploading" | "saved" | "error";
  sourceFile: File | null;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type SavedCarDetail = {
  id: string;
  year: string;
  make: string;
  model: string;
  sellerName: string;
  sellerPhone: string;
  expectedPrice: string;
  sellerEmail: string;
  location: string;
  vin: string;
  notes: string;
  exteriorColor: string;
  interiorColor: string;
  mileage: string;
  bodyStyle: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  registryId: string;
  category: string;
  shortDescription: string;
  overview: string;
  highlights: string;
  conditionSummary: string;
  provenance: string;
  restorationSummary: string;
  receivedCategories: string;
  visibility: string;
  status: string;
};

type SavedFileDetail = {
  id: string;
  filename: string;
  sizeBytes: number;
  contentType: string;
  category: string;
  sortOrder: number;
};

function registryCategoryForFile(file: SavedFileDetail): FileCategory {
  const prefix = file.filename.match(/^(\d{2})_/)?.[1];
  const packetCategory = ({
    "01": "title",
    "02": "registration",
    "03": "bill_of_sale",
    "04": "ownership_history",
    "05": "identity",
    "06": "drivetrain",
    "07": "restoration_history",
    "08": "restoration_invoice",
    "09": "condition",
    "10": "photo_manifest",
    "11": "provenance",
    "12": "application",
  } as Record<string, FileCategory>)[prefix || ""];
  return packetCategory || (file.category as FileCategory) || "records";
}

function CarIntake({ setView, existingCarId, onCarCreated, onPreview, signInPath, returnView }: { setView: (view: View) => void; existingCarId: string | null; onCarCreated: (id: string) => void; onPreview: (id: string) => void; signInPath: string; returnView: "desk" | "admin" }) {
  const returnLabel = returnView === "admin" ? "Admin Console" : "Barnaby’s Desk";
  const [step, setStep] = useState(1);
  const [recordCreated, setRecordCreated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [visibility, setVisibility] = useState("private");
  const [received, setReceived] = useState<string[]>([]);
  const [uploads, setUploads] = useState<IntakeUpload[]>([]);
  const [requirementNotes, setRequirementNotes] = useState<Record<string, string>>({});
  const [savingRequirement, setSavingRequirement] = useState<string | null>(null);
  const [savedCarId, setSavedCarId] = useState<string | null>(existingCarId);
  const [saving, setSaving] = useState(false);
  const [loadingCar, setLoadingCar] = useState(Boolean(existingCarId));
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [photoOrdering, setPhotoOrdering] = useState(false);
  const [heroProcessing, setHeroProcessing] = useState(false);
  const heroAutoStarted = useRef(false);
  const [car, setCar] = useState({
    year: "",
    make: "",
    model: "",
    owner: "",
    phone: "",
    price: "",
    email: "",
    location: "",
    vin: "",
    notes: "",
    exteriorColor: "",
    interiorColor: "",
    mileage: "",
    bodyStyle: "",
    engine: "",
    transmission: "",
    drivetrain: "",
    registryId: "",
    category: "Uncategorized",
    shortDescription: "",
    overview: "",
    highlights: "",
    conditionSummary: "",
    provenance: "",
    restorationSummary: "",
  });

  useEffect(() => {
    if (!existingCarId) return;
    let active = true;
    fetch(`/api/cars/${existingCarId}`)
      .then(async (response) => {
        const data = await response.json() as { car?: SavedCarDetail; files?: SavedFileDetail[]; error?: string };
        if (!response.ok || !data.car) throw new Error(data.error || "The car file could not be loaded.");
        if (!active) return;
        const saved = data.car;
        setCar({
          year: saved.year,
          make: saved.make,
          model: saved.model,
          owner: saved.sellerName,
          phone: saved.sellerPhone,
          price: saved.expectedPrice,
          email: saved.sellerEmail,
          location: saved.location,
          vin: saved.vin,
          notes: saved.notes,
          exteriorColor: saved.exteriorColor,
          interiorColor: saved.interiorColor,
          mileage: saved.mileage,
          bodyStyle: saved.bodyStyle,
          engine: saved.engine,
          transmission: saved.transmission,
          drivetrain: saved.drivetrain,
          registryId: saved.registryId,
          category: saved.category,
          shortDescription: saved.shortDescription,
          overview: saved.overview,
          highlights: saved.highlights,
          conditionSummary: saved.conditionSummary,
          provenance: saved.provenance,
          restorationSummary: saved.restorationSummary,
        });
        setVisibility(saved.visibility);
        const files = data.files || [];
        setUploads(files.map((file) => ({
          id: `saved-${file.id}`,
          serverId: file.id,
          name: file.filename,
          size: file.sizeBytes,
          type: file.contentType,
          previewUrl: file.contentType.startsWith("image/") ? `/api/files/${file.id}` : null,
          category: registryCategoryForFile(file),
          status: "saved",
          sourceFile: null,
        })));
        const recordedCategories = saved.receivedCategories
          .split(",")
          .filter((category): category is Exclude<FileCategory, "records"> => fileChecklist.some((item) => item.id === category));
        const uploadedCategories = files
          .map(registryCategoryForFile)
          .filter((category): category is Exclude<FileCategory, "records"> => fileChecklist.some((item) => item.id === category));
        setReceived(Array.from(new Set([...recordedCategories, ...uploadedCategories])));
        const requirementsResponse = await fetch(`/api/cars/${existingCarId}/requirements`, { cache: "no-store" });
        if (requirementsResponse.ok) {
          const requirementsData = await requirementsResponse.json() as { entries?: { requirementKey: string; entryText: string }[] };
          setRequirementNotes(Object.fromEntries((requirementsData.entries || []).map((entry) => [entry.requirementKey, entry.entryText])));
        }
        setRecordCreated(true);
        setStep(2);
      })
      .catch((error: Error) => { if (active) setSaveError(error.message); })
      .finally(() => { if (active) setLoadingCar(false); });
    return () => { active = false; };
  }, [existingCarId]);

  const setField = (field: keyof typeof car, value: string) => {
    setCar((current) => ({ ...current, [field]: value }));
  };

  const carName = [car.year, car.make, car.model].filter(Boolean).join(" ") || "New motorcar";
  const coreComplete = [car.year, car.make, car.model, car.owner, car.phone, car.price].filter(Boolean).length;
  const completedCount = Math.min(3, Math.ceil(coreComplete / 2)) + received.length;
  const completion = Math.round((completedCount / (3 + fileChecklist.length)) * 100);
  const photoUploads = uploads.filter((file) => file.category === "photos");
  const currentHeroId = [...uploads].reverse().find((file) => file.category === "hero" && file.status === "saved")?.id;

  const styleListingHero = async (sourceFileId: string, carId = savedCarId) => {
    if (!carId || heroProcessing) return;
    setHeroProcessing(true);
    setSaveError("");
    setSaveNotice("Styling the listing hero from the cover photo…");
    try {
      const response = await fetch(`/api/cars/${carId}/generate-hero`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sourceFileId }) });
      const data = await response.json() as { file?: { id: string; filename: string; sizeBytes: number; contentType: string }; error?: string };
      if (!response.ok || !data.file) throw new Error(data.error || "The listing hero could not be styled.");
      setUploads((items) => [...items, { id: `saved-${data.file!.id}`, serverId: data.file!.id, name: data.file!.filename, size: data.file!.sizeBytes, type: data.file!.contentType, previewUrl: `/api/files/${data.file!.id}`, category: "hero", status: "saved", sourceFile: null }]);
      setReceived((items) => items.includes("hero") ? items : [...items, "hero"]);
      setSaveNotice("Listing hero updated from the selected cover photo");
    } catch (error) {
      setSaveNotice("");
      setSaveError(error instanceof Error ? error.message : "The listing hero could not be styled.");
    } finally {
      setHeroProcessing(false);
    }
  };

  useEffect(() => {
    if (loadingCar || heroAutoStarted.current || heroProcessing || !savedCarId) return;
    const alreadyStyled = uploads.some((file) => file.category === "hero" && file.status === "saved" && file.name.startsWith("listing-hero-"));
    const coverPhoto = uploads.find((file) => file.category === "photos" && file.status === "saved" && file.serverId);
    if (alreadyStyled || !coverPhoto?.serverId) return;
    heroAutoStarted.current = true;
    void styleListingHero(coverPhoto.serverId, savedCarId);
  }, [heroProcessing, loadingCar, savedCarId, uploads]);

  const savePhotoOrder = async (orderedPhotos: IntakeUpload[]) => {
    if (!savedCarId || orderedPhotos.some((file) => !file.serverId)) return;
    setPhotoOrdering(true);
    setSaveError("");
    try {
      const response = await fetch(`/api/cars/${savedCarId}/files`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ photoIds: orderedPhotos.map((file) => file.serverId) }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "The photo order could not be saved.");
      setSaveNotice("Photo order saved");
    } catch (caught) { setSaveError(caught instanceof Error ? caught.message : "The photo order could not be saved."); }
    finally { setPhotoOrdering(false); }
  };

  const reorderPhoto = (photoId: string, destination: number) => {
    const currentPhotos = uploads.filter((file) => file.category === "photos");
    const currentIndex = currentPhotos.findIndex((file) => file.id === photoId);
    if (currentIndex < 0) return;
    const nextPhotos = [...currentPhotos];
    const [moved] = nextPhotos.splice(currentIndex, 1);
    nextPhotos.splice(Math.max(0, Math.min(destination, nextPhotos.length)), 0, moved);
    let photoIndex = 0;
    setUploads((current) => current.map((file) => file.category === "photos" ? nextPhotos[photoIndex++] : file));
    void savePhotoOrder(nextPhotos);
    if (destination === 0 && moved.serverId) void styleListingHero(moved.serverId);
  };

  const saveCar = async (status = "intake", receivedOverride = received, visibilityOverride = visibility) => {
    if (!savedCarId) return false;
    setSaving(true);
    setSaveError("");
    setSaveNotice("");
    try {
      const response = await fetch(`/api/cars/${savedCarId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...car, visibility: visibilityOverride, received: receivedOverride, status }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "The car file could not be saved.");
      setSaveNotice("All changes saved");
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "The car file could not be saved.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleReceived = (id: Exclude<FileCategory, "records">) => {
    const next = received.includes(id) ? received.filter((item) => item !== id) : [...received, id];
    setReceived(next);
    void saveCar("intake", next);
  };

  const chooseVisibility = (next: string) => {
    setVisibility(next);
    void saveCar("intake", received, next);
  };

  const saveAndGo = async (next: number) => {
    if (uploads.some((file) => file.status === "uploading")) {
      setSaveError("Please let the current upload finish before leaving this page.");
      return;
    }
    if (await saveCar()) goTo(next);
  };

  const createCar = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car),
      });
      const data = await response.json() as { car?: { id: string; registryId: string; category: string }; error?: string };
      if (!response.ok || !data.car) throw new Error(data.error || "The car file could not be created.");
      setSavedCarId(data.car.id);
      setCar((current) => ({ ...current, registryId: data.car!.registryId, category: data.car!.category }));
      onCarCreated(data.car.id);
      setRecordCreated(true);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "The car file could not be created.");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (item: IntakeUpload, carId: string) => {
    if (!item.sourceFile) return null;
    try {
      const response = await fetch(`/api/cars/${carId}/files`, {
        method: "POST",
        headers: {
          "Content-Type": item.type || "application/octet-stream",
          "X-File-Name": encodeURIComponent(item.name),
          "X-File-Size": String(item.size),
          "X-File-Category": item.category,
        },
        body: item.sourceFile,
      });
      const data = await response.json() as { file?: { id: string; category: string }; extractedText?: string; error?: string };
      if (!response.ok || !data.file) throw new Error(data.error || `${item.name} could not be uploaded.`);
      if (item.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
      setUploads((current) => current.map((file) => file.id === item.id ? {
        ...file,
        serverId: data.file!.id,
        previewUrl: file.type.startsWith("image/") ? `/api/files/${data.file!.id}` : null,
        status: "saved",
        sourceFile: null,
      } : file));
      if (data.file.category !== "records") {
        setReceived((current) => current.includes(data.file!.category) ? current : [...current, data.file!.category]);
      }
      if (data.extractedText) setRequirementNotes((current) => ({ ...current, [item.category]: data.extractedText! }));
      return data.file.id;
    } catch (error) {
      setUploads((current) => current.map((file) => file.id === item.id ? { ...file, status: "error" } : file));
      setSaveError(error instanceof Error ? error.message : `${item.name} could not be uploaded.`);
      return null;
    }
  };

  const saveRequirementEntry = async (requirementKey: string) => {
    if (!savedCarId) return;
    setSavingRequirement(requirementKey);
    try {
      const response = await fetch(`/api/cars/${savedCarId}/requirements`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ requirementKey, entryText: requirementNotes[requirementKey] || "" }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "The checklist entry could not be saved.");
      if ((requirementNotes[requirementKey] || "").trim()) setReceived((current) => current.includes(requirementKey) ? current : [...current, requirementKey]);
      setSaveNotice("Checklist entry saved");
    } catch (error) { setSaveError(error instanceof Error ? error.message : "The checklist entry could not be saved."); }
    finally { setSavingRequirement(null); }
  };

  const handleUploads = async (files: FileList | null, category: FileCategory) => {
    if (!files?.length || !savedCarId) return;
    setSaveError("");
    const selected: IntakeUpload[] = Array.from(files).map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}-${index}`,
      serverId: null,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      category,
      status: "uploading",
      sourceFile: file,
    }));
    setUploads((current) => [...current, ...selected]);
    let firstSavedId: string | null = null;
    for (const item of selected) firstSavedId ||= await uploadFile(item, savedCarId);
    if (category === "photos" && !currentHeroId && firstSavedId) void styleListingHero(firstSavedId, savedCarId);
  };

  const removeUpload = async (id: string) => {
    const target = uploads.find((file) => file.id === id);
    if (!target) return;
    if (target.serverId) {
      setSaveError("");
      try {
        const response = await fetch(`/api/files/${target.serverId}`, { method: "DELETE" });
        const data = await response.json() as { error?: string };
        if (!response.ok) throw new Error(data.error || "The file could not be removed.");
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "The file could not be removed.");
        return;
      }
    }
    setUploads((current) => {
      if (target.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(target.previewUrl);
      const remaining = current.filter((file) => file.id !== id);
      if (target.category !== "records" && !remaining.some((file) => file.category === target.category && file.status === "saved")) {
        setReceived((items) => items.filter((item) => item !== target.category));
      }
      return remaining;
    });
  };

  const goTo = (next: number) => {
    if (!recordCreated && next > 1) return;
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loadingCar) {
    return <main className="grid min-h-[calc(100vh-5.25rem)] place-items-center bg-[#e9e5dc] px-5 text-[#171918]"><div className="text-center"><div className="mx-auto size-10 animate-spin rounded-full border-2 border-black/12 border-t-[#806c49]" /><p className="mt-4 text-lg font-semibold">Opening car file…</p></div></main>;
  }

  if (submitted) {
    return (
      <main className="grid min-h-[calc(100vh-5.25rem)] place-items-center bg-[#e9e5dc] px-5 py-14 text-[#171918]">
        <section className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-7 text-center shadow-[0_18px_50px_rgba(21,23,22,0.08)] sm:p-12">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#60765c]/14 text-[#52654e]"><Check className="size-8" /></div>
          <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-[#806c49]">Handoff complete</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Dean has the {carName}.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-black/58">The car remains on Barnaby’s Desk until the presentation is approved. Any missing files stay visible and assigned.</p>
          <Button onClick={() => setView(returnView)} className="mt-8 h-14 bg-[#1a1c1b] px-7 text-base text-white hover:bg-[#343735]">Return to {returnLabel} <ArrowRight className="ml-2 size-5" /></Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-5.25rem)] bg-[#e9e5dc] px-5 py-9 text-[#171918] sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <button onClick={() => setView(returnView)} className="flex min-h-11 items-center gap-2 text-base font-semibold text-black/58 hover:text-black"><ArrowLeft className="size-5" /> {returnLabel}</button>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#806c49]">{existingCarId ? "Saved inventory file" : "New inventory file"}</p>
            <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">{existingCarId ? carName : "Add a Car"}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-black/58">Get the deal into the system now. Photos and paperwork can follow.</p>
          </div>
          <div className="rounded-lg border border-[#60765c]/24 bg-[#60765c]/8 px-4 py-3 text-sm font-semibold text-[#52654e]"><ShieldCheck className="mr-2 inline size-4" />Secure storage active</div>
        </div>

        <nav className="mt-9 grid gap-2 rounded-2xl border border-black/10 bg-white/55 p-2 sm:grid-cols-4" aria-label="Car intake progress">
          {intakeSteps.map((item) => {
            const active = step === item.number;
            const done = recordCreated && step > item.number;
            return (
              <button
                key={item.number}
                onClick={() => { if (item.number !== step) void saveAndGo(item.number); }}
                disabled={(!recordCreated && item.number > 1) || uploads.some((file) => file.status === "uploading")}
                className={`flex min-h-14 items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-38 ${active ? "bg-[#1a1c1b] text-white" : "text-black/55 hover:bg-white hover:text-black"}`}
              >
                <span className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm ${active ? "border-[var(--gold)] bg-[var(--gold)] text-[#111]" : done ? "border-[#60765c] bg-[#60765c] text-white" : "border-black/17"}`}>{done ? <Check className="size-4" /> : item.number}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {saveError && <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-[#8f3329]/20 bg-[#8f3329]/7 p-4 text-[#7a2d25]" role="alert"><div><p>{saveError}</p>{/sign in/i.test(saveError) && <a href={signInPath} target="_top" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-[#1a1c1b] px-5 font-semibold text-white hover:bg-[#343735]">Sign in again</a>}</div><button onClick={() => setSaveError("")} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-[#8f3329]/10" aria-label="Dismiss error"><X className="size-5" /></button></div>}
        {saveNotice && !saveError && <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#60765c]/24 bg-[#60765c]/8 px-4 py-3 text-sm font-semibold text-[#52654e]" role="status"><Check className="size-4" />{saveNotice}</div>}

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_22rem]">
          <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_14px_42px_rgba(21,23,22,0.06)] sm:p-8">
            {step === 1 && (
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#806c49]/12 text-[#806c49]"><CarFront className="size-6" /></div>
                <h2 className="mt-5 font-display text-3xl sm:text-4xl">Start with what you know.</h2>
                <p className="mt-3 text-lg leading-8 text-black/54">Six quick details create the car file. Nothing gets lost while the rest arrives.</p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div><label className="admin-label" htmlFor="car-year">Year</label><input id="car-year" value={car.year} onChange={(event) => setField("year", event.target.value)} className="admin-field mt-2" inputMode="numeric" placeholder="1967" /></div>
                  <div><label className="admin-label" htmlFor="car-make">Make</label><input id="car-make" value={car.make} onChange={(event) => setField("make", event.target.value)} className="admin-field mt-2" placeholder="Ferrari" /></div>
                  <div><label className="admin-label" htmlFor="car-model">Model</label><input id="car-model" value={car.model} onChange={(event) => setField("model", event.target.value)} className="admin-field mt-2" placeholder="330 GTC" /></div>
                  <div><label className="admin-label" htmlFor="seller-name">Seller’s name</label><input id="seller-name" value={car.owner} onChange={(event) => setField("owner", event.target.value)} className="admin-field mt-2" placeholder="William R." /></div>
                  <div><label className="admin-label" htmlFor="seller-phone">Best phone</label><input id="seller-phone" type="tel" value={car.phone} onChange={(event) => setField("phone", event.target.value)} className="admin-field mt-2" placeholder="(949) 555-0120" /></div>
                  <div><label className="admin-label" htmlFor="asking-price">Expected price</label><input id="asking-price" value={car.price} onChange={(event) => setField("price", event.target.value)} className="admin-field mt-2" placeholder="$825,000" /></div>
                </div>
                <div className="mt-9 flex flex-col gap-3 border-t border-black/8 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-black/45">Partial information is okay. The checklist will flag what remains.</p>
                  <Button disabled={saving} onClick={recordCreated ? () => void saveAndGo(2) : createCar} className="h-14 bg-[var(--gold)] px-7 text-base font-semibold text-[#111] hover:bg-[var(--gold-light)]">{saving ? "Saving…" : recordCreated ? "Save and continue" : "Create car file"} {!saving && <ArrowRight className="ml-2 size-5" />}</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#806c49]">File created · {carName}</p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl">Set the deal terms.</h2>
                <p className="mt-3 text-lg leading-8 text-black/54">Choose who may see the car, then add the details from the call.</p>
                <fieldset className="mt-8">
                  <legend className="admin-label">Initial release</legend>
                  <div className="mt-3 grid gap-3 lg:grid-cols-3">
                    {[
                      ["private", "Private Match", "One-to-one introductions only"],
                      ["members", "Verified Members", "Visible after team approval"],
                      ["public", "Public Registry", "Requires seller approval"],
                    ].map(([id, title, copy]) => (
                      <button key={id} type="button" onClick={() => chooseVisibility(id)} className={`min-h-28 rounded-xl border p-4 text-left transition ${visibility === id ? "border-[#806c49] bg-[#806c49]/8 shadow-[inset_0_0_0_1px_#806c49]" : "border-black/10 bg-[#f7f5f0] hover:border-black/25"}`}>
                        <span className="flex items-center justify-between gap-3 font-semibold">{title}{visibility === id && <Check className="size-5 text-[#806c49]" />}</span>
                        <span className="mt-2 block text-sm leading-6 text-black/49">{copy}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div><label className="admin-label" htmlFor="seller-email">Seller email</label><input id="seller-email" type="email" value={car.email} onChange={(event) => setField("email", event.target.value)} className="admin-field mt-2" placeholder="owner@example.com" /></div>
                  <div><label className="admin-label" htmlFor="car-location">Car location</label><input id="car-location" value={car.location} onChange={(event) => setField("location", event.target.value)} className="admin-field mt-2" placeholder="Newport Beach, California" /></div>
                  <div className="sm:col-span-2"><label className="admin-label" htmlFor="car-vin">VIN or chassis number</label><input id="car-vin" value={car.vin} onChange={(event) => setField("vin", event.target.value)} className="admin-field mt-2" placeholder="Enter now or leave for the checklist" /></div>
                  <div className="sm:col-span-2"><label className="admin-label" htmlFor="call-notes">Notes from the call</label><textarea id="call-notes" value={car.notes} onChange={(event) => setField("notes", event.target.value)} className="admin-field mt-2 min-h-32 resize-y" placeholder="Ownership, condition, timing, known history and anything promised to the seller" /></div>
                </div>
                <div className="mt-10 border-t border-black/10 pt-8">
                  <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#806c49]">Member listing details</p>
                  <h3 className="mt-3 font-display text-3xl">Build the vehicle presentation.</h3>
                  <p className="mt-3 max-w-3xl leading-7 text-black/52">These details become the full Registry listing members see. Leave a field blank when it is not yet documented.</p>
                  <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div><label className="admin-label" htmlFor="exterior-color">Exterior color</label><input id="exterior-color" value={car.exteriorColor} onChange={(event) => setField("exteriorColor", event.target.value)} className="admin-field mt-2" placeholder="Grabber Blue" /></div>
                    <div><label className="admin-label" htmlFor="interior-color">Interior color</label><input id="interior-color" value={car.interiorColor} onChange={(event) => setField("interiorColor", event.target.value)} className="admin-field mt-2" placeholder="Black" /></div>
                    <div><label className="admin-label" htmlFor="mileage">Mileage</label><input id="mileage" value={car.mileage} onChange={(event) => setField("mileage", event.target.value)} className="admin-field mt-2" placeholder="42,150 miles" /></div>
                    <div><label className="admin-label" htmlFor="body-style">Body style</label><input id="body-style" value={car.bodyStyle} onChange={(event) => setField("bodyStyle", event.target.value)} className="admin-field mt-2" placeholder="Fastback" /></div>
                    <div className="sm:col-span-2"><label className="admin-label" htmlFor="engine">Engine</label><input id="engine" value={car.engine} onChange={(event) => setField("engine", event.target.value)} className="admin-field mt-2" placeholder="302 cu in Boss V8" /></div>
                    <div><label className="admin-label" htmlFor="transmission">Transmission</label><input id="transmission" value={car.transmission} onChange={(event) => setField("transmission", event.target.value)} className="admin-field mt-2" placeholder="4-speed manual" /></div>
                    <div><label className="admin-label" htmlFor="drivetrain">Drivetrain</label><input id="drivetrain" value={car.drivetrain} onChange={(event) => setField("drivetrain", event.target.value)} className="admin-field mt-2" placeholder="Rear-wheel drive" /></div>
                    <div className="sm:col-span-2"><label className="admin-label" htmlFor="registry-id">Permanent Registry ID</label><input id="registry-id" value={car.registryId || "Assigned automatically when the file is created"} readOnly className="admin-field mt-2 cursor-not-allowed bg-black/[0.035] font-mono text-sm opacity-70" /></div>
                    <div className="sm:col-span-2"><label className="admin-label" htmlFor="registry-category">Registry category</label><NativeSelect id="registry-category" value={car.category} onChange={(event) => setField("category", event.target.value)} className="mt-2 h-[3.55rem] w-full border-black/17 bg-[#f8f6f1]"><NativeSelectOption value="Uncategorized">Uncategorized</NativeSelectOption><NativeSelectOption value="American Performance">American Performance</NativeSelectOption><NativeSelectOption value="European Sports & GT">European Sports &amp; GT</NativeSelectOption><NativeSelectOption value="British Sports Cars">British Sports Cars</NativeSelectOption><NativeSelectOption value="Prewar Classics">Prewar Classics</NativeSelectOption><NativeSelectOption value="Competition Cars">Competition Cars</NativeSelectOption><NativeSelectOption value="Modern Collectibles">Modern Collectibles</NativeSelectOption><NativeSelectOption value="Coachbuilt & Significant">Coachbuilt &amp; Significant</NativeSelectOption><NativeSelectOption value="Other">Other</NativeSelectOption></NativeSelect></div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <div className="flex items-end justify-between gap-4"><label className="admin-label" htmlFor="listing-short-description">Short description <span className="font-normal text-black/42">· beside the main photo</span></label><span className={`text-sm tabular-nums ${car.shortDescription.length >= SHORT_DESCRIPTION_LIMIT ? "font-semibold text-[#8f3329]" : "text-black/42"}`}>{car.shortDescription.length} / {SHORT_DESCRIPTION_LIMIT}</span></div>
                      <textarea id="listing-short-description" value={car.shortDescription} maxLength={SHORT_DESCRIPTION_LIMIT} onChange={(event) => setField("shortDescription", event.target.value)} className="admin-field mt-2 min-h-40 resize-y" placeholder="A concise introduction shown next to the main photograph…" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <div className="flex items-end justify-between gap-4"><label className="admin-label" htmlFor="listing-description">Long description <span className="font-normal text-black/42">· beneath the gallery</span></label><span className="text-sm tabular-nums text-black/42">{car.overview.length.toLocaleString()} characters · about {LONG_DESCRIPTION_GUIDE.toLocaleString()} recommended</span></div>
                      <textarea id="listing-description" value={car.overview} onChange={(event) => setField("overview", event.target.value)} className="admin-field mt-2 min-h-64 resize-y" placeholder="Write the complete vehicle story: significance, specification, history, condition and what makes this example special…" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4"><label className="admin-label" htmlFor="listing-highlights">Documented highlights <span className="font-normal text-black/42">· one per line</span></label><textarea id="listing-highlights" value={car.highlights} onChange={(event) => setField("highlights", event.target.value)} className="admin-field mt-2 min-h-40 resize-y" placeholder={"Documented ownership history\nPeriod-correct drivetrain\nOlder restoration with records"} /></div>
                    <div className="sm:col-span-2 lg:col-span-4"><label className="admin-label" htmlFor="condition-summary">Condition</label><textarea id="condition-summary" value={car.conditionSummary} onChange={(event) => setField("conditionSummary", event.target.value)} className="admin-field mt-2 min-h-32 resize-y" /></div>
                    <div className="sm:col-span-2 lg:col-span-4"><label className="admin-label" htmlFor="restoration-summary">Restoration history</label><textarea id="restoration-summary" value={car.restorationSummary} onChange={(event) => setField("restorationSummary", event.target.value)} className="admin-field mt-2 min-h-32 resize-y" /></div>
                    <div className="sm:col-span-2 lg:col-span-4"><label className="admin-label" htmlFor="provenance">Provenance</label><textarea id="provenance" value={car.provenance} onChange={(event) => setField("provenance", event.target.value)} className="admin-field mt-2 min-h-32 resize-y" /></div>
                  </div>
                </div>
                <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><Button variant="outline" disabled={saving} onClick={() => void saveAndGo(1)} className="h-14 border-black/16 bg-white px-6 text-base text-[#1a1c1b] hover:bg-[#f1eee7]"><ArrowLeft className="mr-2 size-5" />Back</Button><Button disabled={saving} onClick={() => void saveAndGo(3)} className="h-14 bg-[#1a1c1b] px-7 text-base text-white hover:bg-[#343735]">{saving ? "Saving…" : "Save and continue"} {!saving && <ArrowRight className="ml-2 size-5" />}</Button></div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#806c49]">{carName}</p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl">Collect the car file.</h2>
                <p className="mt-3 text-lg leading-8 text-black/54">Upload each item in its proper section. A phone photo works for paperwork, or you can choose a PDF. Every upload saves immediately.</p>
                <div className="mt-8 space-y-3">
                  {fileChecklist.map((item) => {
                    const done = received.includes(item.id) || Boolean(requirementNotes[item.id]?.trim());
                    const Icon = item.icon;
                    const savedCount = uploads.filter((file) => file.category === item.id && file.status === "saved").length;
                    return (
                      <article key={item.id} className={`rounded-xl border p-4 transition ${done ? "border-[#60765c]/32 bg-[#60765c]/8" : "border-black/10 bg-[#f7f5f0]"}`}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <span className={`grid size-11 shrink-0 place-items-center rounded-lg ${done ? "bg-[#60765c] text-white" : "bg-black/5 text-black/52"}`}>{done ? <Check className="size-5" /> : <Icon className="size-5" />}</span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold">{item.label}</h3>
                            <p className="mt-1 text-sm text-black/45">{item.id === "hero" && heroProcessing ? "Automatically matching the homepage setting and color grade…" : savedCount ? `${savedCount} file${savedCount === 1 ? "" : "s"} saved` : item.help}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.id === "hero" ? <span className="inline-flex min-h-11 items-center rounded-lg border border-[#806c49]/20 bg-white px-4 text-sm font-semibold text-[#6f5b39]">Automatic from cover photo</span> : <>
                            {item.id !== "photos" && item.id !== "video" && (
                              <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-black/14 bg-white px-4 text-sm font-semibold hover:border-[#806c49]">
                                <Camera className="mr-2 size-4" />Scan / photograph
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="sr-only"
                                  onChange={(event) => {
                                    void handleUploads(event.target.files, item.id);
                                    event.currentTarget.value = "";
                                  }}
                                />
                              </label>
                            )}
                            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-[#1a1c1b] px-4 text-sm font-semibold text-white hover:bg-[#343735]">
                              <Upload className="mr-2 size-4" />{item.id === "photos" ? "Add photos" : item.id === "video" ? "Add video" : "Choose file"}
                              <input
                                type="file"
                                multiple
                                accept={item.accept}
                                className="sr-only"
                                onChange={(event) => {
                                  void handleUploads(event.target.files, item.id);
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                            <button type="button" onClick={() => toggleReceived(item.id)} className="min-h-11 rounded-lg border border-black/14 bg-white px-4 text-sm font-semibold hover:border-[#806c49]">
                              {done ? "Mark missing" : "Mark received"}
                            </button>
                            </>}
                          </div>
                        </div>
                        {item.id !== "hero" && item.id !== "photos" && item.id !== "video" && <div className="mt-4 border-t border-black/8 pt-4">
                          <div className="flex items-center justify-between gap-3"><label className="admin-label" htmlFor={`requirement-${item.id}`}>Manual entry or document details</label>{requirementNotes[item.id] && <span className="text-xs font-semibold text-[#60765c]">Editable document text</span>}</div>
                          <textarea id={`requirement-${item.id}`} value={requirementNotes[item.id] || ""} onChange={(event) => setRequirementNotes((current) => ({ ...current, [item.id]: event.target.value }))} onBlur={() => void saveRequirementEntry(item.id)} className="admin-field mt-2 min-h-28 resize-y" placeholder={`Enter ${item.label.toLowerCase()} manually, or upload a text-based PDF to prefill this field.`} />
                          <p className="mt-2 text-xs leading-5 text-black/42">{savingRequirement === item.id ? "Saving…" : "Changes save when you leave this field. Uploaded PDFs are read automatically; review extracted details before release."}</p>
                        </div>}
                      </article>
                    );
                  })}
                  <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-xl border border-dashed border-black/18 bg-white px-4 text-sm font-semibold hover:border-[#806c49] hover:bg-[#806c49]/5">
                    <FileText className="mr-2 size-5 text-[#806c49]" />Upload another supporting document
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="sr-only"
                      onChange={(event) => {
                        void handleUploads(event.target.files, "records");
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                {uploads.length > 0 && (
                  <section className="mt-7" aria-live="polite">
                    <div className="flex items-end justify-between gap-4">
                      <div><h3 className="text-lg font-semibold">Saved files</h3><p className="mt-1 text-sm text-black/45">Stored with this car and available next time</p></div>
                      <span className="rounded-full bg-[#60765c]/12 px-3 py-1.5 text-sm font-semibold text-[#52654e]">{uploads.filter((file) => file.status === "saved").length} saved</span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {uploads.map((file) => (
                        <article key={file.id} className="relative overflow-hidden rounded-xl border border-black/10 bg-[#f7f5f0]">
                          {file.previewUrl ? (
                            <img src={file.previewUrl} alt="" className="h-32 w-full object-cover" />
                          ) : (
                            <div className="grid h-32 place-items-center bg-black/[0.035]"><FileText className="size-9 text-[#806c49]" /></div>
                          )}
                          <button disabled={file.status === "uploading"} onClick={() => removeUpload(file.id)} aria-label={`Remove ${file.name}`} className="absolute right-2 top-2 grid size-10 place-items-center rounded-full bg-black/72 text-white shadow-lg hover:bg-black disabled:cursor-wait disabled:opacity-40"><X className="size-5" /></button>
                          {file.id === currentHeroId && <span className="absolute bottom-[5.55rem] left-2 rounded-full bg-[var(--gold)] px-3 py-2 text-xs font-bold text-[#111] shadow-lg">Current Registry hero</span>}
                          {file.category === "photos" && (() => {
                            const photoIndex = photoUploads.findIndex((photo) => photo.id === file.id);
                            return <div className="absolute bottom-[5.55rem] left-2 right-2 flex items-center justify-between gap-2">
                              <button type="button" disabled={photoOrdering || heroProcessing || file.status !== "saved"} onClick={() => reorderPhoto(file.id, 0)} className={`rounded-full px-3 py-2 text-xs font-bold shadow-lg disabled:opacity-40 ${photoIndex === 0 ? "bg-[var(--gold)] text-[#111] hover:bg-[var(--gold-light)]" : "bg-black/72 text-white hover:bg-black"}`}>{photoIndex === 0 ? "Refresh listing hero" : "Use as listing hero"}</button>
                              <div className="flex gap-1">
                                <button type="button" disabled={photoOrdering || photoIndex === 0 || file.status !== "saved"} onClick={() => reorderPhoto(file.id, photoIndex - 1)} aria-label={`Move ${file.name} earlier`} className="grid size-10 place-items-center rounded-full bg-black/72 text-white shadow-lg hover:bg-black disabled:opacity-35"><ChevronLeft className="size-5" /></button>
                                <button type="button" disabled={photoOrdering || photoIndex === photoUploads.length - 1 || file.status !== "saved"} onClick={() => reorderPhoto(file.id, photoIndex + 1)} aria-label={`Move ${file.name} later`} className="grid size-10 place-items-center rounded-full bg-black/72 text-white shadow-lg hover:bg-black disabled:opacity-35"><ChevronRight className="size-5" /></button>
                              </div>
                            </div>;
                          })()}
                          <div className="p-3">
                            <p className="truncate text-sm font-semibold" title={file.name}>{file.name}</p>
                            <p className="mt-1 truncate text-xs font-semibold text-[#806c49]">{fileCategoryLabels[file.category]}</p>
                            <div className="mt-1 flex items-center justify-between gap-2"><p className="text-xs text-black/44">{formatFileSize(file.size)}</p><span className={`text-xs font-bold ${file.status === "saved" ? "text-[#52654e]" : file.status === "error" ? "text-[#8f3329]" : "text-[#806c49]"}`}>{file.status === "saved" ? "Saved" : file.status === "error" ? "Failed" : "Uploading…"}</span></div>
                            {file.status === "error" && file.sourceFile && savedCarId && <button onClick={() => uploadFile(file, savedCarId)} className="mt-3 min-h-10 w-full rounded-lg border border-[#8f3329]/20 text-sm font-semibold text-[#7a2d25] hover:bg-[#8f3329]/7">Try again</button>}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
                <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><Button variant="outline" disabled={saving || uploads.some((file) => file.status === "uploading")} onClick={() => void saveAndGo(2)} className="h-14 border-black/16 bg-white px-6 text-base text-[#1a1c1b] hover:bg-[#f1eee7]"><ArrowLeft className="mr-2 size-5" />Back</Button><Button disabled={saving || uploads.some((file) => file.status === "uploading")} onClick={() => void saveAndGo(4)} className="h-14 bg-[#1a1c1b] px-7 text-base text-white hover:bg-[#343735]">{uploads.some((file) => file.status === "uploading") ? "Finishing uploads…" : saving ? "Saving…" : "Save and review"} {!saving && !uploads.some((file) => file.status === "uploading") && <ArrowRight className="ml-2 size-5" />}</Button></div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#60765c]/12 text-[#52654e]"><ClipboardCheck className="size-6" /></div>
                <h2 className="mt-5 font-display text-3xl sm:text-4xl">Send it forward.</h2>
                <p className="mt-3 text-lg leading-8 text-black/54">Dean receives the deal summary and presentation work. Barnaby keeps only the missing seller items.</p>
                <div className="mt-8 rounded-2xl border border-black/10 bg-[#f7f5f0] p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-3 border-b border-black/8 pb-5 sm:flex-row sm:items-center">
                    <div><p className="text-sm font-bold uppercase tracking-[0.13em] text-[#806c49]">Ready for internal review</p><h3 className="mt-2 font-display text-3xl">{carName}</h3></div>
                    <span className="w-fit rounded-full bg-[#806c49]/10 px-4 py-2 text-sm font-semibold text-[#6f5d3f]">{visibility === "private" ? "Private Match" : visibility === "members" ? "Verified Members" : "Public Registry"}</span>
                  </div>
                  <dl className="mt-5 grid gap-5 sm:grid-cols-3">
                    <div><dt className="text-sm font-semibold text-black/42">Seller</dt><dd className="mt-1 font-semibold">{car.owner || "Needs confirmation"}</dd></div>
                    <div><dt className="text-sm font-semibold text-black/42">Expected price</dt><dd className="mt-1 font-semibold">{car.price || "Needs confirmation"}</dd></div>
                    <div><dt className="text-sm font-semibold text-black/42">Files selected</dt><dd className="mt-1 font-semibold">{uploads.length} file{uploads.length === 1 ? "" : "s"}</dd></div>
                  </dl>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-black/10 p-5"><p className="text-sm font-bold uppercase tracking-[0.12em] text-black/40">Dean’s next action</p><p className="mt-3 text-lg font-semibold">Review story and presentation</p></div>
                  <div className="rounded-xl border border-black/10 p-5"><p className="text-sm font-bold uppercase tracking-[0.12em] text-black/40">Barnaby’s next action</p><p className="mt-3 text-lg font-semibold">Collect {fileChecklist.length - received.length} missing file{fileChecklist.length - received.length === 1 ? "" : "s"}</p></div>
                </div>
                <div className="mt-9 flex flex-col gap-3 border-t border-black/8 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="outline" disabled={saving} onClick={() => void saveAndGo(3)} className="h-14 border-black/16 bg-white px-6 text-base text-[#1a1c1b] hover:bg-[#f1eee7]"><ArrowLeft className="mr-2 size-5" />Back to files</Button>
                  <div className="sm:text-right"><p className="mb-3 text-sm leading-6 text-black/45">The seller’s approval is still required before any public release.</p><div className="flex flex-col gap-3 sm:flex-row"><Button variant="outline" disabled={saving || !savedCarId} onClick={async () => { if (savedCarId && await saveCar()) onPreview(savedCarId); }} className="h-14 border-black/16 bg-white px-6 text-base text-[#1a1c1b] hover:bg-[#f1eee7]">Preview member listing</Button><Button disabled={saving || uploads.some((file) => file.status === "uploading")} onClick={async () => { if (await saveCar("review")) setSubmitted(true); }} className="h-14 bg-[var(--gold)] px-7 text-base font-semibold text-[#111] hover:bg-[var(--gold-light)]">{saving ? "Saving…" : "Send to Dean"} {!saving && <ArrowRight className="ml-2 size-5" />}</Button></div></div>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl bg-[#181a19] p-6 text-white">
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/46">Car file</p><span className="font-display text-3xl text-[var(--gold-light)]">{completion}%</span></div>
              <Progress value={completion} className="mt-5 h-2.5 bg-white/10 [&_[data-slot=progress-indicator]]:bg-[var(--gold)]" />
              <h2 className="mt-6 font-display text-2xl leading-tight">{carName}</h2>
              <div className="mt-5 space-y-3 text-sm">
                {[
                  [coreComplete >= 2, "Vehicle identified"],
                  [coreComplete >= 4, "Seller contact"],
                  [coreComplete >= 6, "Expected price"],
                  ...fileChecklist.map((item) => [received.includes(item.id), item.label] as [boolean, string]),
                ].map(([done, label]) => (
                  <div key={label as string} className="flex items-start gap-3"><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${done ? "bg-[#60765c] text-white" : "border border-white/20 text-transparent"}`}>{done && <Check className="size-3" />}</span><span className={done ? "text-white/72" : "text-white/42"}>{label as string}</span></div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-black/10 bg-white/60 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.13em] text-black/40">Built-in follow-through</p>
              <p className="mt-4 leading-7 text-black/58">Missing items become tomorrow’s first action. One snooze is allowed before Dean is alerted.</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Membership({ account, setAccount, signInPath, signOutPath, setView }: { account: MemberAccount | null; setAccount: (account: MemberAccount) => void; signInPath: string; signOutPath: string; setView: (view: View) => void }) {
  const [displayName, setDisplayName] = useState(account?.displayName || "");
  const [phone, setPhone] = useState(account?.phone || "");
  const [location, setLocation] = useState(account?.location || "");
  const [collectionNotes, setCollectionNotes] = useState(account?.collectionNotes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/me", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ displayName, phone, location, collectionNotes }) });
      const payload = await response.json() as { account?: MemberAccount; error?: string };
      if (!response.ok || !payload.account) throw new Error(payload.error || "Your application could not be saved.");
      setAccount(payload.account);
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your application could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  if (!account) {
    return (
      <main className="min-h-[calc(100vh-5.25rem)] bg-[#101211] px-5 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">Membership</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.98] sm:text-6xl">Join the private registry.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/63">Create an account to apply, save a private Wanted List, and receive access based on your approved membership level.</p>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[["Verified Member", "Complimentary at launch", "Approved Registry access and a private Wanted List."], ["Priority Member", "$995 annually", "Earlier matches and direct specialist coordination."], ["Private Client", "$2,500 annually", "Invitation-only acquisition and collection support."]].map(([name, price, copy]) => <section key={name} className="rounded-xl border border-white/10 bg-[#181a19] p-6"><h2 className="font-display text-2xl">{name}</h2><p className="mt-3 font-semibold text-[var(--gold-light)]">{price}</p><p className="mt-4 leading-7 text-white/56">{copy}</p></section>)}
          </div>
          <a href={signInPath} target="_top" className="mt-8 inline-flex min-h-14 items-center rounded-lg bg-[var(--gold)] px-7 font-semibold text-[#111]">Create account or sign in <ArrowRight className="ml-2 size-5" /></a>
        </div>
      </main>
    );
  }

  const approved = account.status === "approved";
  const staffAccount = account.role === "admin" || account.role === "barnaby";
  return (
    <main className="min-h-[calc(100vh-5.25rem)] bg-[#101211] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <section className="lg:sticky lg:top-32">
          <p className="eyebrow">{staffAccount ? "Administration" : "Membership"}</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.98] text-white sm:text-6xl">{staffAccount ? "Your staff account." : "Direct access. Quietly handled."}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/63">{staffAccount ? "Manage your contact details and secure access to Motorcar Society administration." : "Every account is reviewed individually. Your approved level controls what appears in the Registry and which private services are available."}</p>
          <div className="mt-7 inline-flex rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-4 py-2 text-sm font-semibold text-[var(--gold-light)]">{approved ? `${account.tier === "leadership" ? "Leadership" : account.tier === "staff" ? "Staff" : account.tier === "private" ? "Private Client" : account.tier === "priority" ? "Priority Member" : "Verified Member"} · Approved` : account.status === "denied" ? "Application not approved" : "Application pending review"}</div>
          <div className="mt-9 space-y-4">
            {(staffAccount ? [
              [ShieldCheck, "Registry administration"],
              [FileText, "Private dossier management"],
              [UserRoundCheck, "Member access controls"],
              [CarFront, "Secure vehicle files"],
            ] : [
              [UserRoundCheck, "Personally reviewed membership"],
              [LockKeyhole, "Private vehicle dossiers"],
              [BellRing, "Matched early-access releases"],
              [Phone, "Direct specialist contact"],
            ]).map(([Icon, label]) => {
              const Component = Icon as typeof UserRoundCheck;
              return <div key={label as string} className="flex items-center gap-4 text-base text-white/78"><Component className="size-5 text-[var(--gold-light)]" />{label as string}</div>;
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#181a19] p-6 sm:p-8">
          <h2 className="font-display text-3xl text-white">{staffAccount ? "Your staff account" : approved ? "Your member account" : "Complete your application"}</h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2"><label htmlFor="display-name" className="field-label">Name</label><input id="display-name" value={displayName} onChange={(event) => { setDisplayName(event.target.value); setSaved(false); }} className="field mt-2" /></div>
            <div><label htmlFor="email" className="field-label">Email</label><input id="email" type="email" value={account.email} readOnly className="field mt-2 opacity-65" /></div>
            <div><label htmlFor="phone" className="field-label">Phone</label><input id="phone" type="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setSaved(false); }} className="field mt-2" /></div>
            <div className="sm:col-span-2"><label htmlFor="location" className="field-label">City and country</label><input id="location" value={location} onChange={(event) => { setLocation(event.target.value); setSaved(false); }} className="field mt-2" placeholder="Newport Beach, United States" /></div>
            {!staffAccount && <div className="sm:col-span-2"><label htmlFor="collection" className="field-label">Tell us what you collect</label><textarea id="collection" value={collectionNotes} onChange={(event) => { setCollectionNotes(event.target.value); setSaved(false); }} className="field mt-2 min-h-32 resize-y" placeholder="Current collection, preferred marques and cars you are seeking" /></div>}
          </div>
          {error && <p className="mt-6 rounded-lg border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}
          <Button disabled={saving} onClick={submit} className="mt-8 h-14 w-full bg-[var(--gold)] text-base font-semibold text-[#111] hover:bg-[var(--gold-light)]">{saving ? "Saving…" : saved ? "Account Saved" : approved ? "Save Account" : "Submit for Review"} {!saving && (saved ? <Check className="ml-2 size-5" /> : <ArrowRight className="ml-2 size-5" />)}</Button>
          {approved && !staffAccount && <Button variant="outline" onClick={() => setView("wanted")} className="mt-3 h-14 w-full border-white/18 bg-transparent text-white hover:bg-white hover:text-black">Open My Wanted List</Button>}
          <a href={signOutPath} target="_top" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg text-sm font-semibold text-white/58 transition hover:bg-white/6 hover:text-white">Sign out or switch account</a>
          <p className="mt-5 text-center text-sm leading-6 text-white/43">{staffAccount ? "Staff access is managed securely by Motorcar Society." : "Applications are reviewed by the Motorcar Society team. No automatic approvals or charges."}</p>
        </section>
      </div>
    </main>
  );
}

function parseContactCsv(source: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"' && quoted && source[index + 1] === '"') { field += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { row.push(field.trim()); field = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) { if (character === "\r" && source[index + 1] === "\n") index += 1; row.push(field.trim()); if (row.some(Boolean)) rows.push(row); row = []; field = ""; }
    else field += character;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  if (!rows.length) return [];
  const headers = rows[0].map((value) => value.toLowerCase().replace(/[^a-z]/g, ""));
  const emailIndex = headers.findIndex((value) => ["email", "emailaddress", "email1"].includes(value));
  const nameIndex = headers.findIndex((value) => ["name", "fullname", "clientname", "contact"].includes(value));
  const firstIndex = headers.findIndex((value) => ["firstname", "first"].includes(value));
  const lastIndex = headers.findIndex((value) => ["lastname", "last"].includes(value));
  const phoneIndex = headers.findIndex((value) => ["phone", "phonenumber", "mobile", "cell"].includes(value));
  if (emailIndex < 0) throw new Error("The CSV needs a column named Email or Email Address.");
  return rows.slice(1).map((values) => ({ email: values[emailIndex] || "", name: nameIndex >= 0 ? values[nameIndex] || "" : [values[firstIndex] || "", values[lastIndex] || ""].filter(Boolean).join(" "), phone: phoneIndex >= 0 ? values[phoneIndex] || "" : "" })).filter((contact) => contact.email);
}

function ContactImport({ onImported }: { onImported: () => void }) {
  const [contacts, setContacts] = useState<{ email: string; name: string; phone: string }[]>([]);
  const [filename, setFilename] = useState("");
  const [permission, setPermission] = useState("needs_review");
  const [source, setSource] = useState("Barnaby client list");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const selectFile = async (file: File | undefined) => {
    if (!file) return;
    try { setContacts(parseContactCsv(await file.text())); setFilename(file.name); setMessage(""); }
    catch (caught) { setContacts([]); setMessage(caught instanceof Error ? caught.message : "That CSV could not be read."); }
  };
  const importList = async () => {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/contacts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contacts, permission, source }) });
      const payload = await response.json() as { imported?: number; skipped?: number; error?: string };
      if (!response.ok) throw new Error(payload.error || "The list could not be imported.");
      setMessage(`${payload.imported || 0} contacts imported${payload.skipped ? `; ${payload.skipped} skipped` : ""}. No emails have been sent.`);
      onImported();
    } catch (caught) { setMessage(caught instanceof Error ? caught.message : "The list could not be imported."); }
    finally { setSaving(false); }
  };
  return <section className="mt-9 rounded-2xl border border-black/10 bg-white/65 p-5 sm:p-7"><h2 className="font-display text-3xl">Import client contacts</h2><p className="mt-3 max-w-3xl leading-7 text-black/58">Upload a CSV with an Email or Email Address column. Names and phone numbers are optional. Contacts remain invitation records until they create their own secure account.</p><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_13rem_15rem_auto] lg:items-end"><div><label className="admin-label">CSV file</label><label className="mt-2 flex min-h-12 cursor-pointer items-center rounded-lg border border-dashed border-black/20 bg-white px-4 font-semibold hover:border-[#806c49]"><Upload className="mr-2 size-5 text-[#806c49]" />{filename || "Choose contact list"}<input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => void selectFile(event.target.files?.[0])} /></label></div><div><label className="admin-label">List source</label><input value={source} onChange={(event) => setSource(event.target.value)} className="admin-field mt-2 h-12" /></div><div><label className="admin-label">Email permission</label><NativeSelect value={permission} onChange={(event) => setPermission(event.target.value)} className="mt-2 h-12 w-full border-black/15"><NativeSelectOption value="needs_review">Needs review</NativeSelectOption><NativeSelectOption value="existing_client">Existing client relationship</NativeSelectOption><NativeSelectOption value="confirmed_opt_in">Confirmed opt-in</NativeSelectOption><NativeSelectOption value="unsubscribed">Do not contact</NativeSelectOption></NativeSelect></div><Button disabled={!contacts.length || saving} onClick={importList} className="h-12 bg-[#806c49] text-white hover:bg-[#695737]">{saving ? "Importing…" : `Import ${contacts.length || ""}`}</Button></div>{message && <p className="mt-5 rounded-lg border border-black/10 bg-white p-4 text-sm" role="status">{message}</p>}<p className="mt-4 text-sm leading-6 text-black/48">Automated marketing should only use contacts whose permission is confirmed. Every message must include an unsubscribe path.</p></section>;
}

function AdminConsole({ onOpenCar, section }: { onOpenCar: (id: string) => void; section: AdminSection }) {
  const [members, setMembers] = useState<MemberAccount[]>([]);
  const [cars, setCars] = useState<RegistryCar[]>([]);
  const [dossierRequests, setDossierRequests] = useState<{ id: string; carId: string; requesterEmail: string; status: string; createdAt: number; year: string; make: string; model: string }[]>([]);
  const [dossierSearch, setDossierSearch] = useState("");
  const [dossierStatus, setDossierStatus] = useState("all");
  const [dossierPage, setDossierPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [wantedRequests, setWantedRequests] = useState<{ id: string; email: string; displayName: string; year: string; make: string; model: string; variant: string; acquisitionLow: string; acquisitionHigh: string; notes: string; status: string }[]>([]);
  const [wantedSearch, setWantedSearch] = useState("");
  const [releaseSearch, setReleaseSearch] = useState("");
  const [releasePage, setReleasePage] = useState(1);
  const [accountSearch, setAccountSearch] = useState("");
  const [accountStatus, setAccountStatus] = useState("all");
  const [accountPage, setAccountPage] = useState(1);
  const [matchCar, setMatchCar] = useState<RegistryCar | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/members", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { members?: MemberAccount[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Accounts could not be loaded.");
      if (active) setMembers(payload.members || []);
    }).catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Accounts could not be loaded."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/dossier-requests", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { requests?: typeof dossierRequests; error?: string };
      if (!response.ok) throw new Error(payload.error || "Dossier requests could not be loaded.");
      if (active) setDossierRequests(payload.requests || []);
    }).catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Dossier requests could not be loaded."); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/cars", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { cars?: RegistryCar[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Car files could not be loaded.");
      if (active) setCars(payload.cars || []);
    }).catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Car files could not be loaded."); });
    return () => { active = false; };
  }, []);

  useEffect(() => { let active = true; fetch("/api/admin/wanted", { cache: "no-store" }).then(async (response) => { const payload = await response.json() as { requests?: typeof wantedRequests }; if (active && response.ok) setWantedRequests(payload.requests || []); }).catch(() => undefined); return () => { active = false; }; }, []);
  useEffect(() => { const matchId = new URLSearchParams(window.location.search).get("match"); if (matchId && cars.length) setMatchCar(cars.find((car) => car.id === matchId) || null); }, [cars]);

  const updateLocal = (userId: string, field: "role" | "tier" | "status", value: string) => setMembers((current) => current.map((member) => member.userId === userId ? { ...member, [field]: value } as MemberAccount : member));
  const updateMemberStatus = (member: MemberAccount, status: MemberAccount["status"]) => setMembers((current) => current.map((item) => item.userId !== member.userId ? item : status === "approved" ? { ...item, status, role: item.role === "applicant" ? "member" : item.role, tier: item.tier === "none" ? "standard" : item.tier } : { ...item, status, role: "applicant", tier: "none" }));
  const save = async (member: MemberAccount) => {
    setSavingId(member.userId);
    setError("");
    try {
      const response = await fetch("/api/admin/members", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: member.userId, role: member.role, tier: member.tier, status: member.status }) });
      const payload = await response.json() as { member?: MemberAccount; error?: string };
      if (!response.ok || !payload.member) throw new Error(payload.error || "Account changes could not be saved.");
      setMembers((current) => current.map((item) => item.userId === member.userId ? payload.member! : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Account changes could not be saved.");
    } finally { setSavingId(null); }
  };

  const updateCarLocal = (id: string, field: "status" | "visibility", value: string) => setCars((current) => current.map((car) => car.id === id ? { ...car, [field]: value } : car));
  const releaseCar = async (car: RegistryCar) => {
    setSavingId(car.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/cars/${car.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: car.status, visibility: car.visibility }) });
      const payload = await response.json() as { car?: RegistryCar; error?: string };
      if (!response.ok || !payload.car) throw new Error(payload.error || "Release settings could not be saved.");
      setCars((current) => current.map((item) => item.id === car.id ? payload.car! : item));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Release settings could not be saved."); }
    finally { setSavingId(null); }
  };

  const deleteCar = async (car: RegistryCar) => {
    const name = [car.year, car.make, car.model].filter(Boolean).join(" ");
    if (!window.confirm(`Permanently delete ${name} (${car.registryId}) and every uploaded file? This cannot be undone.`)) return;
    setSavingId(car.id); setError("");
    try {
      const response = await fetch(`/api/admin/cars/${car.id}`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "The car could not be deleted.");
      setCars((current) => current.filter((item) => item.id !== car.id));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The car could not be deleted."); }
    finally { setSavingId(null); }
  };

  const updateDossierRequest = async (id: string, status: string) => {
    setSavingId(id); setError("");
    try {
      const response = await fetch("/api/admin/dossier-requests", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "The request could not be updated.");
      setDossierRequests((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The request could not be updated."); }
    finally { setSavingId(null); }
  };
  const normalizeWanted = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const wantedMatches = wantedRequests.filter((request) => {
    const textMatch = !wantedSearch || [request.email, request.displayName, request.year, request.make, request.model, request.variant, request.notes].join(" ").toLowerCase().includes(wantedSearch.toLowerCase());
    if (!textMatch || !matchCar) return textMatch;
    return (!request.make || normalizeWanted(matchCar.make).includes(normalizeWanted(request.make))) && (!request.model || normalizeWanted(matchCar.model).includes(normalizeWanted(request.model)) || normalizeWanted(request.model).includes(normalizeWanted(matchCar.model)));
  });
  const canInviteMatch = Boolean(matchCar && matchCar.status === "released" && (matchCar.visibility === "members" || matchCar.visibility === "public"));
  const normalizedReleaseSearch = releaseSearch.trim().toLowerCase();
  const matchingReleaseCars = cars.filter((car) => !normalizedReleaseSearch || [car.year, car.make, car.model, car.registryId, car.category, car.status, car.visibility].join(" ").toLowerCase().includes(normalizedReleaseSearch));
  const releasePageSize = 25;
  const releasePageCount = Math.max(1, Math.ceil(matchingReleaseCars.length / releasePageSize));
  const visibleReleaseCars = matchingReleaseCars.slice((releasePage - 1) * releasePageSize, releasePage * releasePageSize);
  useEffect(() => { if (releasePage > releasePageCount) setReleasePage(releasePageCount); }, [releasePage, releasePageCount]);
  const normalizedAccountSearch = accountSearch.trim().toLowerCase();
  const matchingAccounts = members.filter((member) => (accountStatus === "all" || member.status === accountStatus) && (!normalizedAccountSearch || [member.displayName, member.email, member.role, member.tier, member.location].join(" ").toLowerCase().includes(normalizedAccountSearch))).sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.createdAt - a.createdAt);
  const accountPageSize = 25;
  const accountPageCount = Math.max(1, Math.ceil(matchingAccounts.length / accountPageSize));
  const visibleAccounts = matchingAccounts.slice((accountPage - 1) * accountPageSize, accountPage * accountPageSize);
  useEffect(() => { if (accountPage > accountPageCount) setAccountPage(accountPageCount); }, [accountPage, accountPageCount]);
  const normalizedDossierSearch = dossierSearch.trim().toLowerCase();
  const matchingDossierRequests = dossierRequests.filter((request) => (dossierStatus === "all" || request.status === dossierStatus) && (!normalizedDossierSearch || [request.requesterEmail, request.year, request.make, request.model, request.status].join(" ").toLowerCase().includes(normalizedDossierSearch)));
  const dossierPageSize = 25;
  const dossierPageCount = Math.max(1, Math.ceil(matchingDossierRequests.length / dossierPageSize));
  const visibleDossierRequests = matchingDossierRequests.slice((dossierPage - 1) * dossierPageSize, dossierPage * dossierPageSize);
  useEffect(() => { if (dossierPage > dossierPageCount) setDossierPage(dossierPageCount); }, [dossierPage, dossierPageCount]);
  const adminLinks: { id: AdminSection; label: string }[] = [
    { id: "dossier-requests", label: "Dossier requests" },
    { id: "contacts", label: "Import client contacts" },
    { id: "wanted-list", label: "Member Wanted List" },
    { id: "registry-releases", label: "Registry releases" },
    { id: "accounts", label: "Accounts" },
  ];

  return (
    <main className="min-h-[calc(100vh-5.25rem)] bg-[#e9e5dc] px-5 py-12 text-[#171918] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[90rem]">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#806c49]">Private administration</p>
        <div className="mt-3"><h1 className="font-display text-5xl sm:text-6xl">Admin Console</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-black/58">Manage requests, members, client demand and Registry releases from focused workspaces.</p></div>
        <nav className="mt-8 flex gap-2 overflow-x-auto border-b border-black/12 pb-3" aria-label="Admin Console navigation">
          {adminLinks.map((link) => <a key={link.id} href={`/admin/${link.id}`} className={`shrink-0 rounded-lg px-4 py-3 text-sm font-semibold transition ${section === link.id ? "bg-[#171918] text-white" : "bg-white/55 text-black/58 hover:bg-white hover:text-black"}`}>{link.label}</a>)}
        </nav>
        {error && <p className="mt-7 rounded-lg border border-red-700/20 bg-red-700/8 p-4 text-sm text-red-800">{error}</p>}
        {section === "dossier-requests" && <section className="mt-9 rounded-2xl border border-black/10 bg-white/65 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4"><h2 className="font-display text-3xl">Dossier requests</h2><span className="rounded-full bg-[#806c49]/10 px-3 py-1.5 text-sm font-semibold text-[#6f5d3f]">{dossierRequests.filter((item) => item.status === "new").length} new</span></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]"><label className="relative"><span className="sr-only">Search dossier requests</span><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35" /><input value={dossierSearch} onChange={(event) => { setDossierSearch(event.target.value); setDossierPage(1); }} className="admin-field pl-12" placeholder="Search member or vehicle" /></label><label><span className="sr-only">Filter dossier requests by status</span><NativeSelect value={dossierStatus} onChange={(event) => { setDossierStatus(event.target.value); setDossierPage(1); }} className="h-12 w-full border-black/15"><NativeSelectOption value="all">All statuses</NativeSelectOption><NativeSelectOption value="new">New</NativeSelectOption><NativeSelectOption value="contacted">Contacted</NativeSelectOption><NativeSelectOption value="closed">Closed</NativeSelectOption></NativeSelect></label></div>
          {dossierRequests.length === 0 ? <p className="mt-6 text-black/50">New member requests will appear here.</p> : visibleDossierRequests.length === 0 ? <p className="mt-6 rounded-xl border border-black/8 bg-white p-8 text-center text-black/48">No dossier requests match these filters.</p> : <div className="mt-6 space-y-3">{visibleDossierRequests.map((request) => <article key={request.id} className="grid gap-4 rounded-xl border border-black/10 bg-white p-4 lg:grid-cols-[minmax(15rem,1fr)_minmax(14rem,1fr)_11rem_auto] lg:items-end"><div><p className="font-display text-2xl">{request.year} {request.make} {request.model}</p><p className="mt-1 text-sm text-black/48">Requested {new Date(request.createdAt).toLocaleDateString()}</p></div><div><label className="admin-label">Member</label><p className="mt-2 min-h-11 truncate rounded-lg bg-black/[0.035] px-3 py-3 text-sm">{request.requesterEmail}</p></div><div><label className="admin-label">Status</label><NativeSelect value={request.status} onChange={(event) => setDossierRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: event.target.value } : item))} className="mt-2 h-11 w-full border-black/15"><NativeSelectOption value="new">New</NativeSelectOption><NativeSelectOption value="contacted">Contacted</NativeSelectOption><NativeSelectOption value="closed">Closed</NativeSelectOption></NativeSelect></div><Button disabled={savingId === request.id} onClick={() => void updateDossierRequest(request.id, request.status)} className="h-11 bg-[#806c49] text-white hover:bg-[#695737]">{savingId === request.id ? "Saving…" : "Save"}</Button></article>)}</div>}
          {dossierPageCount > 1 && <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Dossier request pages"><Button variant="outline" disabled={dossierPage <= 1} onClick={() => setDossierPage((page) => Math.max(1, page - 1))} className="h-11 border-black/15"><ChevronLeft className="mr-2 size-4" />Previous</Button><span className="text-sm text-black/50">Page {dossierPage} of {dossierPageCount}</span><Button variant="outline" disabled={dossierPage >= dossierPageCount} onClick={() => setDossierPage((page) => Math.min(dossierPageCount, page + 1))} className="h-11 border-black/15">Next<ChevronRight className="ml-2 size-4" /></Button></nav>}
        </section>}
        {section === "contacts" && <ContactImport onImported={() => undefined} />}
        {section === "wanted-list" && <section id="wanted-demand" className="mt-9 rounded-2xl border border-black/10 bg-white/65 p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><h2 className="font-display text-3xl">Member Wanted List</h2><p className="mt-2 text-black/52">Search member demand or compare it with a Registry car.</p></div><label className="relative w-full lg:max-w-sm"><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35" /><input value={wantedSearch} onChange={(event) => setWantedSearch(event.target.value)} className="admin-field pl-12" placeholder="Search member, make or model" /></label></div>
          {matchCar && <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-[#806c49]/20 bg-[#806c49]/8 p-4 sm:flex-row sm:items-center"><div><p><span className="font-semibold">Suggested matches for:</span> {matchCar.year} {matchCar.make} {matchCar.model}</p>{!canInviteMatch && <p className="mt-1 text-sm text-[#72552b]">Set this car to Released and Members or Public before sending invitations.</p>}</div><button onClick={() => setMatchCar(null)} className="text-sm font-semibold text-[#806c49]">Show all requests</button></div>}
          {wantedMatches.length ? <div className="mt-5 space-y-3">{wantedMatches.map((request) => <article key={request.id} className="grid gap-4 rounded-xl border border-black/10 bg-white p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center"><div><p className="font-display text-2xl">{request.year} {request.make} {request.model}</p><p className="mt-1 text-sm text-black/48">{request.variant || "Any suitable specification"} · {request.acquisitionLow || request.acquisitionHigh ? `$${request.acquisitionLow || "Open"}–$${request.acquisitionHigh || "Open"}` : "Open range"}</p></div><div><p className="font-semibold">{request.displayName || request.email}</p><p className="mt-1 text-sm text-black/48">{request.email}</p></div>{matchCar && canInviteMatch ? <a href={`mailto:${request.email}?subject=${encodeURIComponent(`Private Registry match: ${matchCar.year} ${matchCar.make} ${matchCar.model}`)}&body=${encodeURIComponent(`A vehicle matching your Motorcar Society Wanted List is now available for private review:\n\n${window.location.origin}/registry/${matchCar.id}`)}`} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#806c49] px-5 text-sm font-semibold text-white hover:bg-[#695737]">Invite to view</a> : matchCar ? <span className="rounded-lg bg-black/5 px-4 py-3 text-center text-sm font-semibold text-black/40">Not released</span> : <span className="text-sm font-semibold text-black/38">Active request</span>}</article>)}</div> : <p className="mt-6 rounded-xl border border-black/8 bg-white p-8 text-center text-black/48">No matching Wanted requests.</p>}
        </section>}
        {section === "registry-releases" && <section className="mt-9 rounded-2xl border border-black/10 bg-white/65 p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-3xl">Registry releases</h2><p className="mt-2 text-black/52">Create, review and release individual vehicle files.</p></div><Button onClick={() => onOpenCar("")} className="h-13 bg-[#1a1c1b] px-6 text-white hover:bg-[#343735]">Create car file</Button></div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="w-fit rounded-full bg-black/6 px-3 py-1.5 text-sm font-semibold">{matchingReleaseCars.length} of {cars.length} car files</span><label className="relative w-full sm:max-w-sm"><span className="sr-only">Search car files</span><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35" /><input value={releaseSearch} onChange={(event) => { setReleaseSearch(event.target.value); setReleasePage(1); }} className="admin-field pl-12" placeholder="Search car, ID, category or status" /></label></div>
          {cars.length === 0 ? <p className="mt-7 text-black/50">Create the first car file when an owner is ready.</p> : visibleReleaseCars.length === 0 ? <p className="mt-7 rounded-xl border border-black/8 bg-white p-8 text-center text-black/48">No car files match this search.</p> : <div className="mt-6 space-y-3">{visibleReleaseCars.map((car) => <article key={car.id} className="grid gap-4 rounded-xl border border-black/10 bg-white p-4 xl:grid-cols-[minmax(15rem,1fr)_11rem_11rem_auto_auto_auto_auto] xl:items-end"><div><p className="font-display text-2xl">{car.year} {car.make} {car.model}</p><p className="mt-1 text-sm text-black/48">{car.registryId} · {car.category || "Uncategorized"}</p></div><div><label className="admin-label">Audience</label><NativeSelect value={car.visibility} onChange={(event) => updateCarLocal(car.id, "visibility", event.target.value)} className="mt-2 h-11 w-full border-black/15"><NativeSelectOption value="private">Private match</NativeSelectOption><NativeSelectOption value="members">Members</NativeSelectOption><NativeSelectOption value="public">Public</NativeSelectOption></NativeSelect></div><div><label className="admin-label">Status</label><NativeSelect value={car.status} onChange={(event) => updateCarLocal(car.id, "status", event.target.value)} className="mt-2 h-11 w-full border-black/15"><NativeSelectOption value="intake">Intake</NativeSelectOption><NativeSelectOption value="review">Review</NativeSelectOption><NativeSelectOption value="ready">Ready</NativeSelectOption><NativeSelectOption value="released">Released</NativeSelectOption></NativeSelect></div><Button variant="outline" onClick={() => onOpenCar(car.id)} className="h-11 border-black/15">Open file</Button><a href={`/admin/wanted-list?match=${car.id}`} className="inline-flex h-11 items-center justify-center rounded-lg border border-[#806c49]/30 px-4 text-sm font-semibold text-[#806c49] hover:bg-[#806c49]/8">Find matches</a><Button disabled={savingId === car.id} onClick={() => releaseCar(car)} className="h-11 bg-[#806c49] text-white hover:bg-[#695737]">{savingId === car.id ? "Saving…" : "Save release"}</Button><Button variant="outline" disabled={savingId === car.id} onClick={() => void deleteCar(car)} className="h-11 border-[#8f3329]/25 text-[#8f3329] hover:bg-[#8f3329] hover:text-white"><Trash2 className="mr-2 size-4" />Delete</Button></article>)}</div>}
          {releasePageCount > 1 && <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Car file pages"><Button variant="outline" disabled={releasePage <= 1} onClick={() => setReleasePage((page) => Math.max(1, page - 1))} className="h-11 border-black/15"><ChevronLeft className="mr-2 size-4" />Previous</Button><span className="text-sm text-black/50">Page {releasePage} of {releasePageCount}</span><Button variant="outline" disabled={releasePage >= releasePageCount} onClick={() => setReleasePage((page) => Math.min(releasePageCount, page + 1))} className="h-11 border-black/15">Next<ChevronRight className="ml-2 size-4" /></Button></nav>}
        </section>}
        {section === "accounts" && <section className="mt-9 rounded-2xl border border-black/10 bg-white/65 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4"><h2 className="font-display text-3xl">Accounts</h2><span className="rounded-full bg-black/6 px-3 py-1.5 text-sm font-semibold">{members.filter((member) => member.status === "pending").length} pending</span></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]"><label className="relative"><span className="sr-only">Search accounts</span><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35" /><input value={accountSearch} onChange={(event) => { setAccountSearch(event.target.value); setAccountPage(1); }} className="admin-field pl-12" placeholder="Search name, email, role or location" /></label><label><span className="sr-only">Filter accounts by status</span><NativeSelect value={accountStatus} onChange={(event) => { setAccountStatus(event.target.value); setAccountPage(1); }} className="h-12 w-full border-black/15"><NativeSelectOption value="all">All statuses</NativeSelectOption><NativeSelectOption value="pending">Pending</NativeSelectOption><NativeSelectOption value="approved">Approved</NativeSelectOption><NativeSelectOption value="denied">Denied</NativeSelectOption></NativeSelect></label></div>
          {loading ? <p className="mt-7 text-black/50">Loading accounts…</p> : members.length === 0 ? <p className="mt-7 text-black/50">Accounts appear here after the first sign-in.</p> : visibleAccounts.length === 0 ? <p className="mt-7 rounded-xl border border-black/8 bg-white p-8 text-center text-black/48">No accounts match these filters.</p> : <div className="mt-6 space-y-3">{visibleAccounts.map((member) => <article key={member.userId} className="grid gap-4 rounded-xl border border-black/10 bg-white p-4 lg:grid-cols-[minmax(14rem,1fr)_10rem_11rem_10rem_auto] lg:items-end"><div className="min-w-0"><p className="truncate font-semibold">{member.displayName || member.email}</p><p className="mt-1 truncate text-sm text-black/48">{member.email}</p></div><div><label className="admin-label">Status</label><NativeSelect value={member.status} onChange={(event) => updateMemberStatus(member, event.target.value as MemberAccount["status"])} className="mt-2 h-11 w-full border-black/15"><NativeSelectOption value="pending">Pending</NativeSelectOption><NativeSelectOption value="approved">Approved</NativeSelectOption><NativeSelectOption value="denied">Denied</NativeSelectOption></NativeSelect></div><div><label className="admin-label">Role</label><NativeSelect value={member.role} onChange={(event) => updateLocal(member.userId, "role", event.target.value)} className="mt-2 h-11 w-full border-black/15"><NativeSelectOption value="applicant">Applicant</NativeSelectOption><NativeSelectOption value="member">Member</NativeSelectOption><NativeSelectOption value="barnaby">Barnaby</NativeSelectOption><NativeSelectOption value="admin">Admin</NativeSelectOption></NativeSelect></div><div><label className="admin-label">Level</label><NativeSelect value={member.tier} onChange={(event) => updateLocal(member.userId, "tier", event.target.value)} className="mt-2 h-11 w-full border-black/15"><NativeSelectOption value="none">None</NativeSelectOption><NativeSelectOption value="standard">Verified</NativeSelectOption><NativeSelectOption value="priority">Priority</NativeSelectOption><NativeSelectOption value="private">Private</NativeSelectOption><NativeSelectOption value="staff">Staff</NativeSelectOption><NativeSelectOption value="leadership">Leadership</NativeSelectOption></NativeSelect></div><Button disabled={savingId === member.userId} onClick={() => save(member)} className="h-11 bg-[#806c49] text-white hover:bg-[#695737]">{savingId === member.userId ? "Saving…" : "Save"}</Button></article>)}</div>}
          {accountPageCount > 1 && <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Account pages"><Button variant="outline" disabled={accountPage <= 1} onClick={() => setAccountPage((page) => Math.max(1, page - 1))} className="h-11 border-black/15"><ChevronLeft className="mr-2 size-4" />Previous</Button><span className="text-sm text-black/50">Page {accountPage} of {accountPageCount}</span><Button variant="outline" disabled={accountPage >= accountPageCount} onClick={() => setAccountPage((page) => Math.min(accountPageCount, page + 1))} className="h-11 border-black/15">Next<ChevronRight className="ml-2 size-4" /></Button></nav>}
        </section>}
      </div>
    </main>
  );
}

export default function MotorcarApp({ signInPath, signOutPath, userEmail, initialCarId = null, initialAdminSection = null }: { signInPath: string; signOutPath: string; userEmail: string | null; initialCarId?: string | null; initialAdminSection?: AdminSection | null }) {
  const [view, setView] = useState<View>(initialCarId ? "vehicle" : initialAdminSection ? "admin" : "registry");
  const [adminSection, setAdminSection] = useState<AdminSection>(initialAdminSection || "dossier-requests");
  const [activeCarId, setActiveCarId] = useState<string | null>(null);
  const [registryCarId, setRegistryCarId] = useState<string | null>(initialCarId);
  const normalizedEmail = userEmail?.trim().toLowerCase() ?? null;
  const initialRole: MemberAccount["role"] | null = !normalizedEmail ? null : normalizedEmail === "deank@kirklanddigital.com" || normalizedEmail === "bbforcars@gmail.com" ? "admin" : normalizedEmail === "deankirkland@me.com" ? "member" : "applicant";
  const [account, setAccount] = useState<MemberAccount | null>(initialRole ? { userId: "", email: userEmail!, displayName: userEmail!.split("@")[0], phone: "", location: "", collectionNotes: "", role: initialRole, tier: initialRole === "admin" ? "leadership" : initialRole === "member" ? "standard" : "none", status: initialRole === "applicant" ? "pending" : "approved", createdAt: 0, updatedAt: 0 } : null);
  useEffect(() => {
    if (!userEmail) return;
    let active = true;
    fetch("/api/me", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { account?: MemberAccount; error?: string };
      if (!response.ok || !payload.account) throw new Error(payload.error || "Account unavailable.");
      if (active) setAccount(payload.account);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [userEmail]);
  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/^\/registry\/([^/]+)$/);
      if (match) { setRegistryCarId(decodeURIComponent(match[1])); setView("vehicle"); }
      else {
        const adminMatch = window.location.pathname.match(/^\/admin\/(dossier-requests|contacts|wanted-list|registry-releases|accounts)$/);
        setRegistryCarId(null);
        if (adminMatch) { setAdminSection(adminMatch[1] as AdminSection); setView("admin"); }
        else setView("registry");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const openVehiclePage = (id: string) => { setRegistryCarId(id); setView("vehicle"); window.history.pushState({}, "", `/registry/${id}`); window.scrollTo({ top: 0 }); };
  const returnToRegistry = () => { setRegistryCarId(null); setView("registry"); window.history.pushState({}, "", "/"); window.scrollTo({ top: 0 }); };
  const canAccessDesk = account?.role === "barnaby" && account.status === "approved";
  const canAccessAdmin = account?.role === "admin" && account.status === "approved";
  const canManageCars = canAccessDesk || canAccessAdmin;
  return (
    <div className="min-h-screen bg-[#101211]">
      <Header view={view} setView={(next) => { if (view === "vehicle") window.history.pushState({}, "", "/"); setView(next); }} canAccessDesk={canAccessDesk} canAccessAdmin={canAccessAdmin} userEmail={userEmail} signInPath={signInPath} />
      {view === "registry" && (userEmail ? <Registry setView={setView} onOpenCar={openVehiclePage} showMemberActions={!canAccessDesk && !canAccessAdmin} /> : <Landing signInPath={signInPath} />)}
      {view === "vehicle" && registryCarId && <RegistryVehicle carId={registryCarId} userEmail={userEmail} signInPath={signInPath} onBack={returnToRegistry} />}
      {view === "wanted" && <WantedVehicleList userEmail={userEmail} signInPath={signInPath} />}
      {view === "desk" && canAccessDesk && <BarnabyDesk signInPath={signInPath} onAddCar={() => { setActiveCarId(null); setView("intake"); }} onOpenCar={(id) => { setActiveCarId(id); setView("intake"); }} />}
      {view === "admin" && canAccessAdmin && <AdminConsole section={adminSection} onOpenCar={(id) => { setActiveCarId(id || null); setView("intake"); }} />}
      {view === "admin" && !canAccessAdmin && <Membership account={account} setAccount={setAccount} signInPath={signInPath} signOutPath={signOutPath} setView={setView} />}
      {view === "intake" && canManageCars && <CarIntake signInPath={signInPath} setView={setView} existingCarId={activeCarId} onCarCreated={setActiveCarId} onPreview={openVehiclePage} returnView={canAccessAdmin ? "admin" : "desk"} />}
      {view === "membership" && <Membership key={account?.updatedAt || account?.userId || "anonymous"} account={account} setAccount={setAccount} signInPath={signInPath} signOutPath={signOutPath} setView={setView} />}
      <footer className="border-t border-white/10 bg-[#0d0e0e] px-5 py-8 text-white/46 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <div className="flex flex-wrap gap-x-7 gap-y-2"><button className="hover:text-white">Privacy</button><button className="hover:text-white">Terms</button><button className="hover:text-white">Contact</button></div>
        </div>
      </footer>
    </div>
  );
}
