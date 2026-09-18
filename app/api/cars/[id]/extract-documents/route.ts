import { Output, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { and, eq, inArray } from "drizzle-orm";
import mammoth from "mammoth";
import { OfficeParser } from "officeparser";
import sharp from "sharp";
import WordExtractor from "word-extractor";

import { getDb } from "@/db";
import { carFiles } from "@/db/schema";
import { vehicleExtractionInstructions, vehiclePrefillSchema } from "@/lib/vehicle-document-extraction";
import { canManageCars, carExists, forbidden, getAuthenticatedUser, getBucket, getOrCreateAccount, serverError, unauthorized } from "../../../_lib";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type RouteContext = { params: Promise<{ id: string }> };
type PromptPart =
  | { type: "text"; text: string }
  | { type: "image"; image: Uint8Array; mediaType: string }
  | { type: "file"; data: Uint8Array; filename: string; mediaType: string };

const documentTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/rtf",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/epub+zip",
  "application/json",
  "application/xml",
]);

const officeFileTypes = new Map<string, "xlsx" | "pptx" | "odt" | "ods" | "odp" | "rtf" | "html" | "md" | "epub">([
  ["application/vnd.ms-excel", "xlsx"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
  ["application/vnd.ms-powerpoint", "pptx"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
  ["application/vnd.oasis.opendocument.text", "odt"],
  ["application/vnd.oasis.opendocument.spreadsheet", "ods"],
  ["application/vnd.oasis.opendocument.presentation", "odp"],
  ["application/rtf", "rtf"],
  ["text/rtf", "rtf"],
  ["text/html", "html"],
  ["text/markdown", "md"],
  ["application/epub+zip", "epub"],
]);

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function documentText(bytes: Uint8Array, mediaType: string) {
  if (mediaType.startsWith("text/") || mediaType === "application/json" || mediaType === "application/xml") {
    const officeType = officeFileTypes.get(mediaType);
    if (officeType) return (await OfficeParser.parseOffice(bytes, { fileType: officeType })).toText();
    return new TextDecoder("utf-8").decode(bytes);
  }
  if (mediaType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
  }
  if (mediaType === "application/msword") {
    const document = await new WordExtractor().extract(Buffer.from(bytes));
    return document.getBody();
  }
  const officeType = officeFileTypes.get(mediaType);
  if (officeType) return (await OfficeParser.parseOffice(bytes, { fileType: officeType })).toText();
  return null;
}

export async function POST(request: Request, context: RouteContext) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();
  if (!canManageCars(await getOrCreateAccount(request))) return forbidden();

  try {
    const { id: carId } = await context.params;
    if (!(await carExists(carId))) return Response.json({ error: "Car file not found." }, { status: 404 });
    const body = await request.json() as { fileIds?: unknown };
    const fileIds = Array.isArray(body.fileIds) ? body.fileIds.filter((value): value is string => typeof value === "string").slice(0, 20) : [];
    if (!fileIds.length) return Response.json({ error: "Upload at least one document to analyze." }, { status: 400 });

    const files = await getDb().select().from(carFiles).where(and(eq(carFiles.carId, carId), inArray(carFiles.id, fileIds)));
    if (files.length !== fileIds.length) return Response.json({ error: "One or more documents could not be found." }, { status: 404 });
    if (files.some((file) => !file.contentType.startsWith("image/") && !file.contentType.startsWith("text/") && !documentTypes.has(file.contentType))) return Response.json({ error: "Use a document, text file, scan, or photo for autofill." }, { status: 415 });
    const totalBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0);
    if (totalBytes > 50 * 1024 * 1024) return Response.json({ error: "Choose a document batch totaling 50 MB or less for autofill." }, { status: 413 });

    const content: PromptPart[] = [{ type: "text", text: "Extract supported vehicle-listing fields from these documents. The filename before each attachment is part of the evidence." }];
    for (const file of files) {
      const stored = await getBucket().get(file.storageKey);
      if (!stored) return Response.json({ error: `${file.filename} could not be opened.` }, { status: 404 });
      const bytes = new Uint8Array(await new Response(stored.body).arrayBuffer());
      content.push({ type: "text", text: `Source filename: ${file.filename}` });
      const extractedText = await documentText(bytes, file.contentType);
      if (extractedText !== null) {
        content.push({ type: "text", text: extractedText.trim().slice(0, 200_000) || "[This document contained no readable text.]" });
      } else if (file.contentType.startsWith("image/")) {
        const normalized = await sharp(bytes, { animated: false }).rotate().jpeg({ quality: 88 }).toBuffer();
        content.push({ type: "image", image: normalized, mediaType: "image/jpeg" });
      } else {
        content.push({ type: "file", data: bytes, filename: file.filename, mediaType: file.contentType });
      }
    }

    const result = await generateText({
      model: openai("gpt-6-astra"),
      system: vehicleExtractionInstructions,
      messages: [{ role: "user", content }],
      output: Output.object({ schema: vehiclePrefillSchema, name: "vehicle_listing_prefill" }),
    });

    return Response.json({ fields: result.output, filenames: files.map((file) => file.filename) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    if (/credit card|billing|customer_verification_required/i.test(detail)) return Response.json({ error: "Document analysis needs billing enabled for the configured OpenAI API account. The uploaded files are safely stored." }, { status: 402 });
    if (/api key|unauthorized|authentication|401/i.test(detail)) return Response.json({ error: "Document analysis needs a valid OpenAI API key. The uploaded files are safely stored." }, { status: 503 });
    if (/rate limit|429/i.test(detail)) return Response.json({ error: "Document analysis is temporarily busy. Wait a minute and try the saved documents again." }, { status: 429 });
    return serverError(error, "The documents could not be analyzed. They remain saved with the private car file.");
  }
}
