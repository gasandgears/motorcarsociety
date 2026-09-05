import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { accounts, cars, wantedVehicles } from "@/db/schema";
import { canManageCars, forbidden, getAuthenticatedUser, getOrCreateAccount, serverError, unauthorized } from "../../_lib";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const carId = new URL(request.url).searchParams.get("carId") || "";
    const requests = await getDb().select({ id: wantedVehicles.id, userId: wantedVehicles.userId, email: accounts.email, displayName: accounts.displayName, year: wantedVehicles.year, make: wantedVehicles.make, model: wantedVehicles.model, variant: wantedVehicles.variant, acquisitionLow: wantedVehicles.acquisitionLow, acquisitionHigh: wantedVehicles.acquisitionHigh, notes: wantedVehicles.notes, status: wantedVehicles.status, updatedAt: wantedVehicles.updatedAt }).from(wantedVehicles).innerJoin(accounts, eq(wantedVehicles.userId, accounts.userId)).orderBy(desc(wantedVehicles.updatedAt)).limit(500);
    let car: { id: string; year: string; make: string; model: string; expectedPrice: string; registryId: string } | null = null;
    if (carId) [car] = await getDb().select({ id: cars.id, year: cars.year, make: cars.make, model: cars.model, expectedPrice: cars.expectedPrice, registryId: cars.registryId }).from(cars).where(eq(cars.id, carId)).limit(1);
    const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const scored = requests.map((item) => {
      if (!car) return { ...item, matchScore: 0 };
      let score = 0;
      if (item.make && normalized(car.make).includes(normalized(item.make))) score += 45;
      if (item.model && (normalized(car.model).includes(normalized(item.model)) || normalized(item.model).includes(normalized(car.model)))) score += 45;
      if (item.year && item.year.includes(car.year)) score += 10;
      return { ...item, matchScore: score };
    }).filter((item) => !car || item.matchScore >= 45).sort((a, b) => b.matchScore - a.matchScore);
    return Response.json({ requests: scored, car });
  } catch (error) { return serverError(error, "Wanted requests could not be loaded."); }
}
