import type { MetadataRoute } from "next";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.collectorlegacy.com",
);

const publicPaths = ["/", "/about", "/submit-a-car", "/contact", "/privacy", "/terms", "/buying-collector-cars"];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
