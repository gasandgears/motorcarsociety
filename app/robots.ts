import type { MetadataRoute } from "next";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.collectorlegacy.com",
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/signin", "/reset-password"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
