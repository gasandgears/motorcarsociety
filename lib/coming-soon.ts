import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { cars, carFiles, comingSoonPreviews } from "@/db/schema";

export const comingSoonStatuses = ["intake", "review", "ready"];
export async function getComingSoon() {
  const rows = await getDb().select({ id: cars.id, title: comingSoonPreviews.publicTitle }).from(comingSoonPreviews)
    .innerJoin(cars, eq(cars.id, comingSoonPreviews.carId))
    .innerJoin(carFiles, and(eq(carFiles.id, comingSoonPreviews.coverFileId), eq(carFiles.carId, cars.id), eq(carFiles.category, "hero")))
    .where(and(eq(comingSoonPreviews.enabled, true), inArray(cars.status, comingSoonStatuses)))
    .orderBy(asc(comingSoonPreviews.publicTitle));
  return rows.map(row => ({ ...row, coverUrl: `/api/coming-soon/${row.id}/cover` }));
}
