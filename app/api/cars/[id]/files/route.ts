import { and, asc, eq, inArray } from "drizzle-orm";
import { extractText } from "unpdf";

import { getDb } from "@/db";
import { carFiles, carRequirements } from "@/db/schema";
import { canManageCars, carExists, forbidden, getAuthenticatedUser, getBucket, getOrCreateAccount, safeFilename, serverError, unauthorized } from "../../../_lib";

export const dynamic = "force-dynamic";

const allowedUploadTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id } = await context.params;
    const files = await getDb().select().from(carFiles).where(eq(carFiles.carId, id)).orderBy(asc(carFiles.sortOrder), asc(carFiles.createdAt));
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

    const sizeBytes = Number(request.headers.get("x-file-size") || request.headers.get("content-length") || 0);
    const maximumSize = 150 * 1024 * 1024;
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) return Response.json({ error: "The file size could not be read." }, { status: 400 });
    if (sizeBytes > maximumSize) return Response.json({ error: "Files must be 150 MB or smaller." }, { status: 413 });

    const filename = safeFilename(request.headers.get("x-file-name") || "upload");
    const contentType = (request.headers.get("content-type") || "application/octet-stream").split(";", 1)[0].trim().toLowerCase().slice(0, 160);
    if (!allowedUploadTypes.has(contentType)) return Response.json({ error: "Choose a PDF, Word document, text file, photo, or supported video." }, { status: 415 });
    const suppliedCategory = request.headers.get("x-file-category") || "records";
    const category = ["hero", "photos", "title", "registration", "bill_of_sale", "ownership_history", "identity", "drivetrain", "restoration_history", "restoration_invoice", "condition", "photo_manifest", "provenance", "application", "video", "records"].includes(suppliedCategory) ? suppliedCategory : "records";
    if ((category === "hero" || category === "photos") && !contentType.startsWith("image/")) return Response.json({ error: "Choose an image for vehicle photography." }, { status: 415 });
    if (category === "video" && !contentType.startsWith("video/")) return Response.json({ error: "Choose a supported video file." }, { status: 415 });
    const fileId = crypto.randomUUID();
    const storageKey = `cars/${carId}/${fileId}`;
    const bytes = new Uint8Array(await request.arrayBuffer());
    if (!bytes.byteLength) return Response.json({ error: "The selected file is empty." }, { status: 400 });
    if (bytes.byteLength > maximumSize) return Response.json({ error: "Files must be 150 MB or smaller." }, { status: 413 });

    await getBucket().put(storageKey, new Blob([bytes]).stream(), {
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
      sortOrder: Date.now(),
      createdAt: Date.now(),
    };

    try {
      await getDb().insert(carFiles).values(file);
      let extractedText = "";
      if (contentType === "application/pdf" && !["photos", "video", "records"].includes(category)) {
        try {
          const extracted = await extractText(bytes, { mergePages: true });
          extractedText = extracted.text.trim().slice(0, 20000);
          if (extractedText) await getDb().insert(carRequirements).values({ id: crypto.randomUUID(), carId, requirementKey: category, entryText: extractedText, sourceFileId: fileId, completionMethod: "document", updatedAt: Date.now() }).onConflictDoUpdate({ target: [carRequirements.carId, carRequirements.requirementKey], set: { entryText: extractedText, sourceFileId: fileId, completionMethod: "document", updatedAt: Date.now() } });
        } catch (extractionError) { console.error("PDF extraction failed", extractionError); }
      }
      return Response.json({ file, extractedText }, { status: 201 });
    } catch (error) {
      await getBucket().delete(storageKey);
      throw error;
    }
  } catch (error) {
    return serverError(error, "The file could not be uploaded. Please try again.");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!getAuthenticatedUser(request)) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();
  try {
    const { id: carId } = await context.params;
    const body = await request.json() as { photoIds?: unknown };
    const photoIds = Array.isArray(body.photoIds) ? body.photoIds.filter((id): id is string => typeof id === "string") : [];
    if (!photoIds.length || photoIds.length > 250 || new Set(photoIds).size !== photoIds.length) return Response.json({ error: "Choose a valid photo order." }, { status: 400 });
    const matching = await getDb().select({ id: carFiles.id }).from(carFiles).where(and(eq(carFiles.carId, carId), eq(carFiles.category, "photos"), inArray(carFiles.id, photoIds)));
    if (matching.length !== photoIds.length) return Response.json({ error: "One or more photos do not belong to this car." }, { status: 400 });
    for (const [index, id] of photoIds.entries()) await getDb().update(carFiles).set({ sortOrder: index + 1 }).where(eq(carFiles.id, id));
    return Response.json({ saved: true, photoIds });
  } catch (error) {
    return serverError(error, "The photo order could not be saved.");
  }
}
