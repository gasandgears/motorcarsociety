import { and, asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { carFiles, cars } from "@/db/schema";
import { getAuthenticatedUser, getOrCreateAccount, serverError } from "../../_lib";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const account = getAuthenticatedUser(request) ? await getOrCreateAccount(request) : null;
    const staff = account?.status === "approved" && (account.role === "admin" || account.role === "barnaby");
    const member = account?.status === "approved" && account.role === "member";
    const [car] = await getDb().select().from(cars).where(eq(cars.id, id)).limit(1);
    if (!car) return Response.json({ error: "Vehicle not found." }, { status: 404 });
    const visible = staff || (car.status === "released" && (car.visibility === "public" || (member && car.visibility === "members")));
    if (!visible) return Response.json({ error: "This vehicle is not available to your account." }, { status: 403 });

    const photos = await getDb().select({ id: carFiles.id, filename: carFiles.filename, category: carFiles.category, createdAt: carFiles.createdAt })
      .from(carFiles)
      .where(and(eq(carFiles.carId, id), inArray(carFiles.category, ["hero", "photos"])))
      .orderBy(asc(carFiles.sortOrder), asc(carFiles.createdAt));
    const videos = await getDb().select({ id: carFiles.id, filename: carFiles.filename })
      .from(carFiles)
      .where(and(eq(carFiles.carId, id), eq(carFiles.category, "video")))
      .orderBy(asc(carFiles.createdAt));

    return Response.json({
      car: {
        id: car.id,
        year: car.year,
        make: car.make,
        model: car.model,
        location: car.location,
        expectedPrice: car.expectedPrice,
        notes: car.notes,
        exteriorColor: car.exteriorColor,
        interiorColor: car.interiorColor,
        mileage: car.mileage,
        bodyStyle: car.bodyStyle,
        engine: car.engine,
        transmission: car.transmission,
        drivetrain: car.drivetrain,
        registryId: car.registryId,
        category: car.category,
        shortDescription: car.shortDescription,
        overview: car.overview,
        highlights: car.highlights,
        conditionSummary: car.conditionSummary,
        provenance: car.provenance,
        restorationSummary: car.restorationSummary,
        visibility: car.visibility,
        status: car.status,
      },
      photos: photos.sort((a, b) => Number(b.category === "hero") - Number(a.category === "hero") || (a.category === "hero" && b.category === "hero" ? b.createdAt - a.createdAt : 0)).map((photo) => ({ id: photo.id, filename: photo.filename, url: `/api/registry/${id}/photos/${photo.id}` })),
      videos: videos.map((video) => ({ ...video, url: `/api/registry/${id}/photos/${video.id}` })),
      access: staff ? "staff" : member ? "member" : "public",
    });
  } catch (error) {
    return serverError(error, "The vehicle details could not be loaded.");
  }
}
