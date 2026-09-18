import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { blankOnlyPrefill, vehiclePrefillSchema } from "../lib/vehicle-document-extraction.ts";

test("document prefill only fills blank listing fields", () => {
  const current = { year: "1976", make: "", model: "Eldorado", category: "" };
  const extracted = vehiclePrefillSchema.parse({
    year: "1975", make: "Cadillac", model: "Coupe de Ville", owner: null, phone: null, price: null,
    email: null, location: null, vin: null, notes: null, exteriorColor: null, interiorColor: null,
    mileage: null, bodyStyle: null, engine: null, transmission: null, drivetrain: null,
    category: "American Performance", shortDescription: null, overview: null, highlights: null,
    conditionSummary: null, provenance: null, restorationSummary: null, sourceSummary: "registration.pdf",
  });
  assert.deepEqual(blankOnlyPrefill(current, extracted), { year: "1976", make: "Cadillac", model: "Eldorado", category: "American Performance" });
});

test("document extraction remains private and staff-authorized", async () => {
  const route = await readFile(new URL("../app/api/cars/[id]/extract-documents/route.ts", import.meta.url), "utf8");
  assert.match(route, /canManageCars/);
  assert.match(route, /carId\), inArray\(carFiles\.id, fileIds\)/);
  assert.match(route, /createOpenAI/);
  assert.match(route, /openai\("gpt-6-astra"\)/);
});

test("Step 1 exposes document-assisted intake", async () => {
  const source = await readFile(new URL("../app/motorcar-app.tsx", import.meta.url), "utf8");
  assert.match(source, /Prefill the entire car listing/);
  assert.match(source, /handleDocumentPrefill/);
  assert.match(source, /documentDraft: true/);
});
