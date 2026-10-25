import type { Metadata } from "next";

// Existing, owner-confirmed primary domain. Keep Vercel as an alternate host.
export const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.collectorlegacy.com";

export function publicMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, PUBLIC_SITE_URL).toString();
  return {
    title: { absolute: title }, description, alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Motorcar Society Private Registry", type: "website" },
    twitter: { card: "summary", title, description },
  };
}
