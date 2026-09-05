import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { carFiles } from "@/db/schema";
import { canManageCars, carExists, forbidden, getAuthenticatedUser, getBucket, getOrCreateAccount, safeFilename, serverError, unauthorized } from "../../../_lib";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id } = await context.params;
    const files = await getDb().select().from(carFiles).where(eq(carFiles.carId, id)).orderBy(desc(carFiles.createdAt));
    return Response.json({ files });
  } catch (error) {
    return serverError(error, "The uploaded files could not be loaded.");
  }
}

export async function POST(request: Request, context: RouteContext) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();

  try {
    const { id: carId } = await context.params;
    if (!(await carExists(carId))) return Response.json({ error: "Car file not found." }, { status: 404 });
    if (!request.body) return Response.json({ error: "Choose a file to upload." }, { status: 400 });

    const sizeBytes = Number(request.headers.get("content-length") || request.headers.get("x-file-size") || 0);
    const maximumSize = 150 * 1024 * 1024;
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) return Response.json({ error: "The file size could not be read." }, { status: 400 });
    if (sizeBytes > maximumSize) return Response.json({ error: "Files must be 150 MB or smaller." }, { status: 413 });

    const filename = safeFilename(request.headers.get("x-file-name") || "upload");
    const contentType = (request.headers.get("content-type") || "application/octet-stream").slice(0, 160);
    const suppliedCategory = request.headers.get("x-file-category") || "records";
    const category = ["photos", "title", "numbers", "history", "video", "records"].includes(suppliedCategory) ? suppliedCategory : "records";
    const fileId = crypto.randomUUID();
    const storageKey = `cars/${carId}/${fileId}`;

    await getBucket().put(storageKey, request.body, {
      httpMetadata: { contentType },
      customMetadata: { carId, filename: encodeURIComponent(filename), uploadedBy: user.id },
    });

    const file = {
      id: fileId,
      carId,
      storageKey,
      filename,
      contentType,
      sizeBytes,
      category,
      uploadedBy: user.id,
      uploadedByEmail: user.email,
      createdAt: Date.now(),
    };

    try {
      await getDb().insert(carFiles).values(file);
      return Response.json({ file }, { status: 201 });
    } catch (error) {
      await getBucket().delete(storageKey);
      throw error;
    }
  } catch (error) {
    return serverError(error, "The file could not be uploaded. Please try again.");
  }
}
