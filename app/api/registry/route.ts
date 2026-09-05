import { desc } from "drizzle-orm";

import { getDb } from "@/db";
import { cars } from "@/db/schema";
import { getAuthenticatedUser, getOrCreateAccount, serverError } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const account = getAuthenticatedUser(request) ? await getOrCreateAccount(request) : null;
    const staff = account?.status === "approved" && (account.role === "admin" || account.role === "barnaby");
    const approvedMember = account?.status === "approved" && account.role === "member";
    const records = await getDb().select({
      id: cars.id,
      year: cars.year,
      make: cars.make,
      model: cars.model,
      detail: cars.location,
      expectedPrice: cars.expectedPrice,
      visibility: cars.visibility,
      status: cars.status,
      updatedAt: cars.updatedAt,
    }).from(cars).orderBy(desc(cars.updatedAt)).limit(50);

    const visible = records.filter((car) => {
      if (staff) return true;
      if (car.status !== "released") return false;
      if (car.visibility === "public") return true;
      return approvedMember && car.visibility === "members";
    });

    return Response.json({ cars: visible, access: staff ? "staff" : approvedMember ? account?.tier || "standard" : "public" });
  } catch (error) {
    return serverError(error, "The Registry is temporarily unavailable.");
  }
}
