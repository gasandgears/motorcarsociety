import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("declares development preview metadata", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /["']codex-preview["']\s*:\s*["']development["']/);
});

test("provides the complete public information section", async () => {
  const routes = [
    ["../app/about/page.tsx", /Verified Member/],
    ["../app/privacy/page.tsx", /Private vehicle records/],
    ["../app/terms/page.tsx", /Vehicle information and guidance/],
    ["../app/contact/page.tsx", /Barnaby Brokaw/],
    ["../app/submit-a-car/page.tsx", /VehicleSubmissionForm/],
  ];
  for (const [path, expected] of routes) assert.match(await readFile(new URL(path, import.meta.url), "utf8"), expected);
});

test("keeps public footer destinations available", async () => {
  const shell = await readFile(new URL("../components/public-page-shell.tsx", import.meta.url), "utf8");
  for (const path of ["/about", "/privacy", "/terms", "/contact", "/submit-a-car"]) assert.match(shell, new RegExp(path.replaceAll("/", "\\/")));
});
