"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const ID = "G-HXR3LSPNKL";
// Keep Google collection paused until tag-level automatic collection is verified off.
const GOOGLE_ANALYTICS_ENABLED = false;
const CHOICE = "registry-analytics-consent-v1";
const ORIGIN = "https://www.collectorlegacy.com";
const PUBLIC_PATHS = new Set(["/", "/about", "/buying-collector-cars", "/contact", "/submit-a-car", "/privacy", "/terms"]);

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  va?: (...args: unknown[]) => void;
  vaq?: unknown[];
  [key: `ga-disable-${string}`]: boolean;
};

function allowed() {
  try {
    return localStorage.getItem(CHOICE) === "yes" && PUBLIC_PATHS.has(location.pathname) &&
      ["collectorlegacy.com", "www.collectorlegacy.com"].includes(location.hostname) &&
      !navigator.doNotTrack?.includes("1") && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  } catch { return false; }
}

export function PublicAnalytics() {
  const pathname = usePathname();
  const lastPage = useRef<string | null>(null);
  const [choice, setChoice] = useState<string | null>("pending");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const w = window as unknown as AnalyticsWindow;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CHOICE && event.key !== null) return;
      w[`ga-disable-${ID}`] = !GOOGLE_ANALYTICS_ENABLED || !allowed();
      if (!allowed()) window.location.reload();
    };
    window.addEventListener("storage", onStorage);
    queueMicrotask(() => {
      try { setChoice(localStorage.getItem(CHOICE)); } catch { setChoice("no"); }
    });
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const w = window as unknown as AnalyticsWindow;
    w[`ga-disable-${ID}`] = !GOOGLE_ANALYTICS_ENABLED || !allowed();
    if (!allowed()) { lastPage.current = null; return; }
    if (lastPage.current === pathname) return;
    lastPage.current = pathname;

    if (GOOGLE_ANALYTICS_ENABLED && !w.gtag) {
      w.dataLayer = w.dataLayer || [];
      // Google's command queue requires the standard arguments object.
      // eslint-disable-next-line prefer-rest-params
      w.gtag = function () { w.dataLayer!.push(arguments); };
      w.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      if (GOOGLE_ANALYTICS_ENABLED) w.gtag!("set", { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, allow_enhanced_conversions: false, page_location: ORIGIN + pathname, page_referrer: "", page_title: "Motorcar Society public website" });
      w.gtag("js", new Date());
      w.gtag("config", ID, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        allow_enhanced_conversions: false,
      });
      const script = document.createElement("script");
      script.id = "registry-google-analytics";
      script.async = true;
      script.referrerPolicy = "no-referrer";
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
      document.head.appendChild(script);
    }
    if (GOOGLE_ANALYTICS_ENABLED) w.gtag!("set", { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, allow_enhanced_conversions: false, page_location: ORIGIN + pathname, page_referrer: "", page_title: "Motorcar Society public website" });
    if (GOOGLE_ANALYTICS_ENABLED) w.gtag!("event", "page_view", { send_to: ID, page_location: ORIGIN + pathname, page_referrer: "", page_title: "Motorcar Society public website" });

    if (!w.va) {
      w.va = (...args: unknown[]) => { (w.vaq = w.vaq || []).push(args); };
      w.va("beforeSend", (event: { type: string; url: string }) => {
        if (!allowed() || event.type !== "pageview") return null;
        try {
          // Vercel attaches external referrers independently of beforeSend.
          // Suppress the event rather than transmit a potentially identifying URL.
          if (document.referrer) {
            const referrer = new URL(document.referrer);
            if (referrer.pathname !== "/" || referrer.search || referrer.hash) return null;
          }
          const url = new URL(event.url);
          if (!PUBLIC_PATHS.has(url.pathname)) return null;
          return { ...event, url: ORIGIN + url.pathname };
        } catch { return null; }
      });
      const script = document.createElement("script");
      script.id = "registry-vercel-analytics";
      script.defer = true;
      script.referrerPolicy = "no-referrer";
      script.src = "/_vercel/insights/script.js";
      document.head.appendChild(script);
    }
  }, [pathname, choice]);

  function choose(value: string) {
    try { localStorage.setItem(CHOICE, value); } catch { return; }
    (window as unknown as AnalyticsWindow)[`ga-disable-${ID}`] = !GOOGLE_ANALYTICS_ENABLED || value !== "yes";
    setChoice(value);
    setEditing(false);
    // A full navigation clears already-loaded analytics after a withdrawal.
    if (value === "no") window.location.reload();
  }

  if (!PUBLIC_PATHS.has(pathname) || choice === "pending") return null;
  if (choice !== null && !editing) return pathname === "/privacy" ? <button onClick={() => setEditing(true)} className="fixed bottom-4 left-4 z-50 rounded border border-white/30 bg-black px-4 py-2 text-sm text-white">Analytics choices</button> : null;
  return <aside aria-label="Analytics choices" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded border border-white/30 bg-black p-5 text-sm text-white shadow-xl">
    <p>May we use Google Analytics and Vercel Analytics to measure visits to our public pages? Analytics stays off until you allow it. Private Registry pages and form details are excluded. You can change your choice on our <a href="/privacy" className="underline">privacy page</a>.</p>
    <div className="mt-4 flex gap-3"><button onClick={() => choose("no")} className="rounded border px-4 py-2">Decline</button><button onClick={() => choose("yes")} className="rounded border px-4 py-2">Allow analytics</button></div>
  </aside>;
}
