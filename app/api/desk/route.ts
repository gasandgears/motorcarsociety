import { desc } from "drizzle-orm";

import { getDb } from "@/db";
import { carTaskStates, cars } from "@/db/schema";
import { forbidden, getAuthenticatedUser, getOrCreateAccount, isBarnaby, serverError, unauthorized } from "../_lib";
import { buildDeskSummary } from "./_tasks";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();
  const account = await getOrCreateAccount(request);
  if (!isBarnaby(account)) return forbidden();
  try {
    const [savedCars, savedStates] = await Promise.all([
      getDb().select().from(cars).orderBy(desc(cars.updatedAt)).limit(50),
      getDb().select().from(carTaskStates),
    ]);
    const statesByCar = new Map<string, typeof savedStates>();
    for (const state of savedStates) {
      const current = statesByCar.get(state.carId) || [];
      current.push(state);
      statesByCar.set(state.carId, current);
    }
    const now = Date.now();
    const deskCars = savedCars.map((car) => ({
      ...car,
      currentAction: buildDeskSummary(car, statesByCar.get(car.id) || [], now),
    })).sort((left, right) => {
      const rank = { urgent: 0, warning: 1, ready: 2 };
      const toneDifference = rank[left.currentAction.tone] - rank[right.currentAction.tone];
      return toneDifference || left.currentAction.dueAt - right.currentAction.dueAt;
    });
    return Response.json({ cars: deskCars });
  } catch (error) {
    return serverError(error, "Barnaby’s action list is temporarily unavailable.");
  }
}
