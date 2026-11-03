import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../lib/registry-access.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { canViewRegistryCar } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('Registry access matrix fails closed and preserves staff access', () => {
  for (const status of ['intake', 'review', 'ready', 'released']) {
    for (const visibility of ['private', 'members', 'public', 'unknown']) {
      const car = { status, visibility };
      assert.equal(canViewRegistryCar(car, true, false), true);
      assert.equal(canViewRegistryCar(car, false, true), status === 'released' && ['public', 'members'].includes(visibility));
      assert.equal(canViewRegistryCar(car, false, false), status === 'released' && visibility === 'public');
    }
  }
});
test('Search, totals and categories share the visibility filter', async () => {
  const route = await readFile(new URL('../app/api/registry/route.ts', import.meta.url), 'utf8');
  assert.match(route, /approvedMember \? inArray\(cars.visibility, \["public", "members"\]\) : eq\(cars.visibility, "public"\)/);
  assert.match(route, /conditions.push\(visibilityFilter\)/);
  assert.match(route, /count\(\)[\s\S]*?\.where\(where\)/);
  assert.match(route, /selectDistinct[\s\S]*?\.where\(visibilityFilter\)/);
});
test('Detail, media and dossier routes enforce visibility; media is never shared-cacheable', async () => {
  for (const path of ['../app/api/registry/[id]/route.ts', '../app/api/registry/[id]/photos/[fileId]/route.ts', '../app/api/dossier-requests/route.ts']) {
    const route = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.match(route, /canViewRegistryCar\(car, staff,/);
  }
  const media = await readFile(new URL('../app/api/registry/[id]/photos/[fileId]/route.ts', import.meta.url), 'utf8');
  assert.match(media, /"Cache-Control", "private, no-store"/);
});
