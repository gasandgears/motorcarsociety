import { and, count, desc, eq, like, or, type SQL } from "drizzle-orm";

import { getDb } from "@/db";
import { cars } from "@/db/schema";
import { getAuthenticatedUser, getOrCreateAccount, serverError } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const account = getAuthenticatedUser(request) ? await getOrCreateAccount(request) : null;
    const staff = account?.status === "approved" && (account.role === "admin" || account.role === "barnaby");
    const approvedMember = account?.status === "approved" && account.role === "member";
    const url = new URL(request.url);
    const search = (url.searchParams.get("search") || "").trim().slice(0, 100);
    const category = (url.searchParams.get("category") || "").trim().slice(0, 80);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const pageSize = 12;
    const conditions: SQL[] = [];
    if (!staff) conditions.push(approvedMember ? and(eq(cars.status, "released"), or(eq(cars.visibility, "public"), eq(cars.visibility, "members")))! : and(eq(cars.status, "released"), eq(cars.visibility, "public"))!);
    if (category && category !== "All") conditions.push(eq(cars.category, category));
    if (search) {
      const term = `%${search.replace(/[%_]/g, "")}%`;
      conditions.push(or(like(cars.year, term), like(cars.make, term), like(cars.model, term), like(cars.registryId, term))!);
    }
    const where = conditions.length ? and(...conditions) : undefined;
    const db = getDb();
    const records = await db.select({
      id: cars.id,
      year: cars.year,
      make: cars.make,
      model: cars.model,
      detail: cars.location,
      expectedPrice: cars.expectedPrice,
      visibility: cars.visibility,
      status: cars.status,
      category: cars.category,
      registryId: cars.registryId,
      updatedAt: cars.updatedAt,
    }).from(cars).where(where).orderBy(desc(cars.updatedAt)).limit(pageSize).offset((page - 1) * pageSize);
    const [totalRow] = await db.select({ value: count() }).from(cars).where(where);
    const categoryRows = await db.selectDistinct({ category: cars.category }).from(cars).orderBy(cars.category);
    const total = totalRow?.value || 0;
    return Response.json({ cars: records, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)), categories: categoryRows.map((row) => row.category).filter(Boolean), access: staff ? "staff" : approvedMember ? account?.tier || "standard" : "public" });
  } catch (error) {
    return serverError(error, "The Registry is temporarily unavailable.");
  }
}
