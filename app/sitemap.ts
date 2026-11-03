import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { cars } from "@/db/schema";

export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.collectorlegacy.com",
);

const publicPaths = ["/", "/about", "/submit-a-car", "/contact", "/privacy", "/terms", "/buying-collector-cars"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const released = await getDb().select({ id: cars.id }).from(cars).where(and(eq(cars.status, "released"), inArray(cars.visibility, ["public", "members", "private"])));
  return [...publicPaths, ...released.map((car) => `/registry/${car.id}`)].map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
