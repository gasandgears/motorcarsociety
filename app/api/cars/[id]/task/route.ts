import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { carTaskStates } from "@/db/schema";
import { carExists, cleanText, forbidden, getAuthenticatedUser, isBarnaby, serverError, unauthorized } from "../../../_lib";
import { validDeskTaskKeys } from "../../../desk/_tasks";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();
  if (!isBarnaby(user)) return forbidden();
  try {
    const { id: carId } = await context.params;
    if (!(await carExists(carId))) return Response.json({ error: "Car file not found." }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    const taskKey = cleanText(body.taskKey, 40);
    const operation = cleanText(body.operation, 20);
    if (!validDeskTaskKeys.has(taskKey)) return Response.json({ error: "That action is no longer available." }, { status: 400 });
    if (operation !== "complete" && operation !== "snooze") return Response.json({ error: "Choose complete or snooze." }, { status: 400 });

    const db = getDb();
    const [existing] = await db.select().from(carTaskStates).where(and(eq(carTaskStates.carId, carId), eq(carTaskStates.taskKey, taskKey))).limit(1);
    if (operation === "snooze" && (existing?.snoozeCount || 0) >= 1) {
      return Response.json({ error: "This action has already been snoozed once." }, { status: 409 });
    }

    const now = Date.now();
    const next = operation === "complete"
      ? { status: "completed", dueAt: existing?.dueAt || now, snoozeCount: existing?.snoozeCount || 0, completedAt: now, updatedAt: now }
      : { status: "open", dueAt: now + 24 * 60 * 60 * 1000, snoozeCount: 1, completedAt: null, updatedAt: now };
    await db.insert(carTaskStates).values({
      id: crypto.randomUUID(),
      carId,
      taskKey,
      ...next,
    }).onConflictDoUpdate({
      target: [carTaskStates.carId, carTaskStates.taskKey],
      set: next,
    });
    return Response.json({ saved: true });
  } catch (error) {
    return serverError(error, "The action could not be updated.");
  }
}
