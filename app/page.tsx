"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Camera,
  CarFront,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  FolderOpen,
  Gauge,
  ListChecks,
  LockKeyhole,
  Menu,
  Phone,
  ShieldCheck,
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

type View = "registry" | "wanted" | "desk" | "intake" | "membership";

const inventory = [
  { year: "1967", name: "Ferrari 275 GTB/4", detail: "Long-term West Coast ownership", status: "Private Match", code: "F" },
  { year: "1931", name: "Duesenberg Model J", detail: "Coachwork history under review", status: "Member Preview", code: "D" },
  { year: "1973", name: "Porsche 911 Carrera RS", detail: "Touring specification", status: "Available", code: "P" },
];

const deskItems = [
  {
    car: "1967 Ferrari 330 GTC",
    owner: "William R. · Newport Beach",
    task: "Confirm the asking price",
    action: "Call seller",
    due: "Due today",
    progress: 64,
    tone: "urgent",
    icon: Phone,
  },
  {
    car: "1956 Jaguar XK140 MC",
    owner: "Denise K. · San Diego",
    task: "Title copy and 8 photographs missing",
    action: "Open checklist",
    due: "Due Friday",
    progress: 78,
    tone: "warning",
    icon: ListChecks,
  },
  {
    car: "1971 Lamborghini Miura SV",
    owner: "Private collection · Arizona",
    task: "Dossier complete and ready",
    action: "Approve release",
    due: "Ready now",
    progress: 100,
    tone: "ready",
    icon: Check,
  },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-full border border-[var(--gold)] text-[13px] font-semibold tracking-[0.14em] text-[var(--gold-light)]">
        MS
      </div>
      <div className="text-left">
        <div className="font-display text-[1.15rem] leading-none tracking-[0.04em]">MOTORCAR SOCIETY</div>
        <div className="mt-1.5 text-[0.72rem] font-semibold tracking-[0.23em] text-[var(--gold-light)]">PRIVATE REGISTRY</div>
      </div>
    </div>
  );
}

function Header({ view, setView }: { view: View; setView: (view: View) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links: { id: View; label: string }[] = [
    { id: "registry", label: "The Registry" },
    { id: "wanted", label: "Wanted List" },
    { id: "desk", label: "Barnaby’s Desk" },
  ];

  const selectView = (next: View) => {
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

        <Button
          variant="outline"
          onClick={() => selectView("membership")}
          className="hidden h-11 border-white/20 bg-transparent px-5 text-white hover:bg-white hover:text-black lg:inline-flex"
        >
          Member Access
        </Button>

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
            {[...links, { id: "membership" as View, label: "Member Access" }].map((link) => (
              <Button key={link.id} variant="ghost" onClick={() => selectView(link.id)} className="h-13 justify-between px-3 text-base text-white">
                {link.label}<ChevronRight className="size-5" />
              </Button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function Registry({ setView }: { setView: (view: View) => void }) {
  return (
    <main>
      <section className="relative min-h-[42rem] overflow-hidden border-b border-white/10 lg:min-h-[46rem]">
        <img
          src="/motorcar-hero.png"
          alt="A late-1950s competition sports car in a private collection room"
          className="absolute inset-0 h-full w-full object-cover object-[61%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,8,8,0.97)_0%,rgba(7,8,8,0.85)_31%,rgba(7,8,8,0.23)_64%,rgba(7,8,8,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,8,8,0.88)_0%,transparent_35%)]" />

        <div className="relative mx-auto flex min-h-[42rem] max-w-[90rem] items-end px-5 pb-10 pt-28 sm:px-8 lg:min-h-[46rem] lg:items-center lg:px-12 lg:pb-0 lg:pt-0">
          <div className="max-w-[38rem]">
            <div className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold-light)]">
              <span className="h-px w-10 bg-[var(--gold)]" />Private Release 01
            </div>
            <h1 className="font-display text-[clamp(3.2rem,7vw,6.8rem)] leading-[0.88] tracking-[-0.025em] text-white">
              1958
              <span className="mt-2 block text-[0.54em] leading-[1.02] text-white/95">Competition Sports Car</span>
            </h1>
            <p className="mt-7 max-w-[34rem] text-lg leading-8 text-white/76 sm:text-xl">
              European competition history. California collection since 1987. Full identity available to verified members.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-14 bg-[var(--gold)] px-7 text-base font-semibold text-[#111] hover:bg-[var(--gold-light)]">
                    Request Private Dossier<ArrowRight className="ml-2 size-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[88vh] overflow-y-auto border-white/12 bg-[#151716] p-0 text-white sm:max-w-2xl">
                  <div className="relative h-56 overflow-hidden sm:h-72">
                    <img src="/motorcar-hero.png" alt="Private-release competition sports car" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151716] to-transparent" />
                  </div>
                  <div className="px-6 pb-7 sm:px-8">
                    <DialogHeader>
                      <DialogTitle className="font-display text-4xl font-normal leading-tight">Private Dossier Request</DialogTitle>
                      <DialogDescription className="mt-2 text-base leading-7 text-white/64">
                        A Motorcar Society specialist will confirm access and contact you directly.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {["Ownership file", "Competition record", "Condition report", "High-resolution gallery"].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-[0.96rem] text-white/82">
                          <FileCheck2 className="size-5 text-[var(--gold-light)]" />{item}
                        </div>
                      ))}
                    </div>
                    <DialogFooter className="mt-7 sm:justify-start">
                      <Button className="h-12 bg-[var(--gold)] px-6 text-base text-[#111] hover:bg-[var(--gold-light)]">Continue as Member</Button>
                      <Button variant="outline" className="h-12 border-white/18 bg-transparent px-6 text-base text-white hover:bg-white hover:text-black">Speak with Barnaby</Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={() => setView("membership")}
                className="h-14 border-white/24 bg-black/20 px-7 text-base text-white hover:bg-white hover:text-black"
              >
                Apply for Membership
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden rounded-xl border border-white/12 bg-black/52 px-5 py-4 backdrop-blur-md xl:block">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/48">Release status</div>
          <div className="mt-2 flex items-center gap-2 text-base text-white"><span className="size-2.5 rounded-full bg-[var(--gold-light)]" />Private Match · 36 hours remaining</div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#101211] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[90rem]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="eyebrow">Recently entered</p><h2 className="mt-3 font-display text-4xl text-white sm:text-5xl">The Registry</h2></div>
            <Button variant="ghost" className="w-fit px-0 text-base text-[var(--gold-light)] hover:bg-transparent hover:text-white">View all available cars <ArrowRight className="ml-2 size-5" /></Button>
          </div>

          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {inventory.map((car) => (
              <button
                key={car.name}
                className="group min-h-64 overflow-hidden rounded-xl border border-white/10 bg-[#181a19] text-left transition hover:border-[var(--gold)]/65 hover:bg-[#1d1f1e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)]"
              >
                <div className="flex h-28 items-center justify-between border-b border-white/8 bg-[radial-gradient(circle_at_20%_0%,rgba(179,154,104,0.15),transparent_58%)] px-6">
                  <span className="font-display text-7xl text-white/[0.08]">{car.code}</span>
                  <span className="rounded-full border border-white/14 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-white/60">{car.status}</span>
                </div>
                <div className="p-6">
                  <p className="text-sm font-semibold tracking-[0.14em] text-[var(--gold-light)]">{car.year}</p>
                  <h3 className="mt-2 font-display text-[1.8rem] leading-tight text-white">{car.name}</h3>
                  <div className="mt-5 flex items-center justify-between gap-4 text-[0.95rem] text-white/56">
                    <span>{car.detail}</span><ChevronRight className="size-5 shrink-0 transition group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e9e5dc] px-5 py-16 text-[#171918] sm:px-8 lg:px-12 lg:py-20">
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
      </section>
    </main>
  );
}

function WantedList() {
  const [saved, setSaved] = useState(false);
  const [choices, setChoices] = useState<string[]>(["Ferrari", "Jaguar"]);
  const toggle = (choice: string) => {
    setChoices((current) => current.includes(choice) ? current.filter((item) => item !== choice) : [...current, choice]);
    setSaved(false);
  };

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
              <div><label className="block text-base font-semibold text-white" htmlFor="specific-car">Specific car</label><input id="specific-car" className="field mt-3" placeholder="Example: 1967 Ferrari 275 GTB/4" /></div>
              <div>
                <label className="block text-base font-semibold text-white" htmlFor="value-range">Acquisition range</label>
                <select id="value-range" className="field mt-3" defaultValue="500-1500">
                  <option value="250-500">$250,000–$500,000</option><option value="500-1500">$500,000–$1.5 million</option><option value="1500-5000">$1.5–$5 million</option><option value="5000+">Above $5 million</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-white" htmlFor="era">Preferred era</label>
                <select id="era" className="field mt-3" defaultValue="postwar">
                  <option value="prewar">Pre-war</option><option value="postwar">1946–1969</option><option value="seventies">1970–1989</option><option value="modern">1990 and newer</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-white" htmlFor="condition">Primary interest</label>
                <select id="condition" className="field mt-3" defaultValue="important">
                  <option value="important">Historically significant cars</option><option value="competition">Competition cars</option><option value="preservation">Highly original cars</option><option value="concours">Concours-level cars</option>
                </select>
              </div>
            </div>

            <Button onClick={() => setSaved(true)} className="mt-9 h-14 w-full bg-[var(--gold)] text-base font-semibold text-[#111] hover:bg-[var(--gold-light)] sm:w-auto sm:px-8">
              {saved ? <Check className="mr-2 size-5" /> : <ShieldCheck className="mr-2 size-5" />}{saved ? "Wanted List Saved" : "Save Private Wanted List"}
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
                <div className="flex justify-between gap-3"><span className="text-white/55">Range</span><span className="text-right text-white">$500K–$1.5M</span></div>
                <div className="flex justify-between gap-3"><span className="text-white/55">Alert order</span><span className="text-right text-white">Private Match</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function BarnabyDesk({ setView }: { setView: (view: View) => void }) {
  const [completed, setCompleted] = useState<string[]>([]);

  return (
    <main className="min-h-[calc(100vh-5.25rem)] bg-[#e9e5dc] px-5 py-10 text-[#171918] sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#806c49]">Friday, September 4</p>
            <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Good morning, Barnaby.</h1>
            <p className="mt-5 text-xl text-black/61">Three cars need your attention. Start with the phone call.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setView("intake")} variant="outline" className="h-12 border-black/15 bg-white/50 px-5 text-base hover:bg-white"><FolderOpen className="mr-2 size-5" /> Add a Car</Button>
            <Button className="h-12 bg-[#1a1c1b] px-5 text-base text-white hover:bg-[#343735]"><Gauge className="mr-2 size-5" /> Pipeline</Button>
          </div>
        </div>

        <div className="mt-9 grid gap-4 xl:grid-cols-[1fr_22rem]">
          <section className="space-y-4">
            {deskItems.map((item) => {
              const done = completed.includes(item.car);
              const Icon = item.icon;
              return (
                <article key={item.car} className={`rounded-2xl border bg-white p-5 shadow-[0_12px_36px_rgba(21,23,22,0.06)] sm:p-6 ${done ? "border-[#71866c]/35 opacity-70" : "border-black/10"}`}>
                  <div className="grid gap-5 lg:grid-cols-[4rem_1fr_15rem] lg:items-center">
                    <div className={`grid size-14 place-items-center rounded-xl ${item.tone === "urgent" ? "bg-[#8f3329]/10 text-[#8f3329]" : item.tone === "warning" ? "bg-[#a67b30]/12 text-[#806022]" : "bg-[#60765c]/12 text-[#556951]"}`}>
                      <Icon className="size-7" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <h2 className="font-display text-[1.7rem] leading-tight">{item.car}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${item.tone === "urgent" ? "bg-[#8f3329]/10 text-[#8f3329]" : item.tone === "warning" ? "bg-[#a67b30]/12 text-[#79591e]" : "bg-[#60765c]/12 text-[#52654e]"}`}>{done ? "Completed" : item.due}</span>
                      </div>
                      <p className="mt-2 text-[0.95rem] text-black/48">{item.owner}</p>
                      <p className={`mt-4 text-lg font-semibold ${done ? "line-through" : ""}`}>{item.task}</p>
                      <div className="mt-4 flex items-center gap-3">
                        <Progress value={done ? 100 : item.progress} className="h-2 max-w-sm bg-black/8 [&_[data-slot=progress-indicator]]:bg-[#806c49]" />
                        <span className="text-sm font-semibold text-black/45">{done ? 100 : item.progress}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 lg:items-stretch">
                      <Button
                        disabled={done}
                        onClick={() => setCompleted((current) => [...current, item.car])}
                        className="h-12 justify-between bg-[#1a1c1b] px-5 text-base text-white hover:bg-[#343735] disabled:bg-[#60765c] disabled:text-white"
                      >
                        {done ? "Done" : item.action}{done ? <Check className="size-5" /> : <ArrowRight className="size-5" />}
                      </Button>
                      {!done && item.tone !== "ready" && <Button variant="ghost" className="h-10 text-black/48 hover:bg-black/5 hover:text-black">Remind me at 2:00</Button>}
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
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/42">Last 7 days</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-4"><div className="font-display text-4xl">11</div><div className="mt-1 text-sm text-black/52">Actions closed</div></div>
                <div className="rounded-lg bg-white p-4"><div className="font-display text-4xl">2</div><div className="mt-1 text-sm text-black/52">Cars released</div></div>
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
  { id: "photos", label: "Exterior and interior photos", icon: Camera },
  { id: "title", label: "Title or registration copy", icon: FileText },
  { id: "numbers", label: "VIN, engine and chassis numbers", icon: CarFront },
  { id: "history", label: "Service and ownership records", icon: FolderOpen },
  { id: "video", label: "Walkaround video", icon: Upload },
];

function CarIntake({ setView }: { setView: (view: View) => void }) {
  const [step, setStep] = useState(1);
  const [recordCreated, setRecordCreated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [visibility, setVisibility] = useState("private");
  const [received, setReceived] = useState<string[]>([]);
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
  });

  const setField = (field: keyof typeof car, value: string) => {
    setCar((current) => ({ ...current, [field]: value }));
  };

  const carName = [car.year, car.make, car.model].filter(Boolean).join(" ") || "New motorcar";
  const coreComplete = [car.year, car.make, car.model, car.owner, car.phone, car.price].filter(Boolean).length;
  const completedCount = Math.min(3, Math.ceil(coreComplete / 2)) + received.length;
  const completion = Math.round((completedCount / 8) * 100);

  const toggleReceived = (id: string) => {
    setReceived((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const goTo = (next: number) => {
    if (!recordCreated && next > 1) return;
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <main className="grid min-h-[calc(100vh-5.25rem)] place-items-center bg-[#e9e5dc] px-5 py-14 text-[#171918]">
        <section className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-7 text-center shadow-[0_18px_50px_rgba(21,23,22,0.08)] sm:p-12">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#60765c]/14 text-[#52654e]"><Check className="size-8" /></div>
          <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-[#806c49]">Handoff complete</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Dean has the {carName}.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-black/58">The car remains on Barnaby’s Desk until the presentation is approved. Any missing files stay visible and assigned.</p>
          <Button onClick={() => setView("desk")} className="mt-8 h-14 bg-[#1a1c1b] px-7 text-base text-white hover:bg-[#343735]">Return to Barnaby’s Desk <ArrowRight className="ml-2 size-5" /></Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-5.25rem)] bg-[#e9e5dc] px-5 py-9 text-[#171918] sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <button onClick={() => setView("desk")} className="flex min-h-11 items-center gap-2 text-base font-semibold text-black/58 hover:text-black"><ArrowLeft className="size-5" /> Barnaby’s Desk</button>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#806c49]">New inventory file</p>
            <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Add a Car</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-black/58">Get the deal into the system now. Photos and paperwork can follow.</p>
          </div>
          <div className="rounded-lg border border-black/10 bg-white/55 px-4 py-3 text-sm font-semibold text-black/48">Prototype · Files are not stored yet</div>
        </div>

        <nav className="mt-9 grid gap-2 rounded-2xl border border-black/10 bg-white/55 p-2 sm:grid-cols-4" aria-label="Car intake progress">
          {intakeSteps.map((item) => {
            const active = step === item.number;
            const done = recordCreated && step > item.number;
            return (
              <button
                key={item.number}
                onClick={() => goTo(item.number)}
                disabled={!recordCreated && item.number > 1}
                className={`flex min-h-14 items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-38 ${active ? "bg-[#1a1c1b] text-white" : "text-black/55 hover:bg-white hover:text-black"}`}
              >
                <span className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm ${active ? "border-[var(--gold)] bg-[var(--gold)] text-[#111]" : done ? "border-[#60765c] bg-[#60765c] text-white" : "border-black/17"}`}>{done ? <Check className="size-4" /> : item.number}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

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
                  <Button onClick={() => { setRecordCreated(true); goTo(2); }} className="h-14 bg-[var(--gold)] px-7 text-base font-semibold text-[#111] hover:bg-[var(--gold-light)]">Create car file <ArrowRight className="ml-2 size-5" /></Button>
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
                      <button key={id} type="button" onClick={() => setVisibility(id)} className={`min-h-28 rounded-xl border p-4 text-left transition ${visibility === id ? "border-[#806c49] bg-[#806c49]/8 shadow-[inset_0_0_0_1px_#806c49]" : "border-black/10 bg-[#f7f5f0] hover:border-black/25"}`}>
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
                <div className="mt-9 flex justify-end"><Button onClick={() => goTo(3)} className="h-14 bg-[#1a1c1b] px-7 text-base text-white hover:bg-[#343735]">Continue to files <ArrowRight className="ml-2 size-5" /></Button></div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#806c49]">{carName}</p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl">Collect the car file.</h2>
                <p className="mt-3 text-lg leading-8 text-black/54">Choose files from the phone or mark each item as received. Anything missing stays assigned.</p>
                <label className="mt-8 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/16 bg-[#f7f5f0] px-5 text-center transition hover:border-[#806c49] hover:bg-[#806c49]/5">
                  <Upload className="size-8 text-[#806c49]" />
                  <span className="mt-3 text-lg font-semibold">Choose photos or documents</span>
                  <span className="mt-1 text-sm text-black/45">Phone camera, photo library, PDF or video</span>
                  <input type="file" multiple className="sr-only" onChange={() => setReceived((current) => current.includes("photos") ? current : [...current, "photos"])} />
                </label>
                <div className="mt-7 space-y-3">
                  {fileChecklist.map((item) => {
                    const done = received.includes(item.id);
                    const Icon = item.icon;
                    return (
                      <button key={item.id} onClick={() => toggleReceived(item.id)} className={`flex min-h-16 w-full items-center gap-4 rounded-xl border px-4 text-left transition ${done ? "border-[#60765c]/32 bg-[#60765c]/8" : "border-black/10 bg-white hover:border-[#806c49]/55"}`}>
                        <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${done ? "bg-[#60765c] text-white" : "bg-black/5 text-black/52"}`}>{done ? <Check className="size-5" /> : <Icon className="size-5" />}</span>
                        <span className="flex-1 font-semibold">{item.label}</span>
                        <span className={`text-sm font-semibold ${done ? "text-[#52654e]" : "text-[#8f3329]"}`}>{done ? "Received" : "Missing"}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-9 flex justify-end"><Button onClick={() => goTo(4)} className="h-14 bg-[#1a1c1b] px-7 text-base text-white hover:bg-[#343735]">Review handoff <ArrowRight className="ml-2 size-5" /></Button></div>
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
                    <div><dt className="text-sm font-semibold text-black/42">Files received</dt><dd className="mt-1 font-semibold">{received.length} of {fileChecklist.length}</dd></div>
                  </dl>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-black/10 p-5"><p className="text-sm font-bold uppercase tracking-[0.12em] text-black/40">Dean’s next action</p><p className="mt-3 text-lg font-semibold">Review story and presentation</p></div>
                  <div className="rounded-xl border border-black/10 p-5"><p className="text-sm font-bold uppercase tracking-[0.12em] text-black/40">Barnaby’s next action</p><p className="mt-3 text-lg font-semibold">Collect {fileChecklist.length - received.length} missing file{fileChecklist.length - received.length === 1 ? "" : "s"}</p></div>
                </div>
                <div className="mt-9 flex flex-col gap-3 border-t border-black/8 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-black/45">The seller’s approval is still required before any public release.</p>
                  <Button onClick={() => setSubmitted(true)} className="h-14 bg-[var(--gold)] px-7 text-base font-semibold text-[#111] hover:bg-[var(--gold-light)]">Send to Dean <ArrowRight className="ml-2 size-5" /></Button>
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

function Membership() {
  return (
    <main className="min-h-[calc(100vh-5.25rem)] bg-[#101211] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <section className="lg:sticky lg:top-32">
          <p className="eyebrow">Membership</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.98] text-white sm:text-6xl">Direct access. Quietly handled.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/63">Membership is complimentary and approved individually. Tell us what you collect and what you are actively seeking.</p>
          <div className="mt-9 space-y-4">
            {[
              [UserRoundCheck, "Personally reviewed membership"],
              [LockKeyhole, "Private vehicle dossiers"],
              [BellRing, "Matched early-access releases"],
              [Phone, "Direct specialist contact"],
            ].map(([Icon, label]) => {
              const Component = Icon as typeof UserRoundCheck;
              return <div key={label as string} className="flex items-center gap-4 text-base text-white/78"><Component className="size-5 text-[var(--gold-light)]" />{label as string}</div>;
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#181a19] p-6 sm:p-8">
          <h2 className="font-display text-3xl text-white">Apply for private access</h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div><label htmlFor="first-name" className="field-label">First name</label><input id="first-name" className="field mt-2" /></div>
            <div><label htmlFor="last-name" className="field-label">Last name</label><input id="last-name" className="field mt-2" /></div>
            <div><label htmlFor="email" className="field-label">Email</label><input id="email" type="email" className="field mt-2" /></div>
            <div><label htmlFor="phone" className="field-label">Phone</label><input id="phone" type="tel" className="field mt-2" /></div>
            <div className="sm:col-span-2"><label htmlFor="location" className="field-label">City and country</label><input id="location" className="field mt-2" placeholder="Newport Beach, United States" /></div>
            <div className="sm:col-span-2"><label htmlFor="collection" className="field-label">Tell us what you collect</label><textarea id="collection" className="field mt-2 min-h-32 resize-y" placeholder="Current collection, preferred marques and cars you are seeking" /></div>
          </div>
          <Button className="mt-8 h-14 w-full bg-[var(--gold)] text-base font-semibold text-[#111] hover:bg-[var(--gold-light)]">Submit for Review <ArrowRight className="ml-2 size-5" /></Button>
          <p className="mt-5 text-center text-sm leading-6 text-white/43">Applications are reviewed by the Motorcar Society team. No automatic approvals.</p>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("registry");
  return (
    <div className="min-h-screen bg-[#101211]">
      <Header view={view} setView={setView} />
      {view === "registry" && <Registry setView={setView} />}
      {view === "wanted" && <WantedList />}
      {view === "desk" && <BarnabyDesk setView={setView} />}
      {view === "intake" && <CarIntake setView={setView} />}
      {view === "membership" && <Membership />}
      <footer className="border-t border-white/10 bg-[#0d0e0e] px-5 py-8 text-white/46 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <div className="flex flex-wrap gap-x-7 gap-y-2"><button className="hover:text-white">Privacy</button><button className="hover:text-white">Terms</button><button className="hover:text-white">Contact</button></div>
        </div>
      </footer>
    </div>
  );
}
