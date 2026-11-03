import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../lib/registry-access.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { canViewRegistryCar, canPreviewRegistryCar, registryTeaser } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('Registry access matrix fails closed and preserves staff access', () => {
  for (const status of ['intake', 'review', 'ready', 'released']) {
    for (const visibility of ['private', 'members', 'public', 'unknown']) {
      const car = { status, visibility };
      assert.equal(canViewRegistryCar(car, true, false), true);
      assert.equal(canViewRegistryCar(car, false, true), status === 'released' && ['public', 'members'].includes(visibility));
      assert.equal(canViewRegistryCar(car, false, false), false);
      assert.equal(canPreviewRegistryCar(car), status === 'released' && ['private', 'members', 'public'].includes(visibility));
    }
  }
});
test('Search, totals and categories share the visibility filter', async () => {
  const route = await readFile(new URL('../app/api/registry/route.ts', import.meta.url), 'utf8');
  assert.match(route, /inArray\(cars.visibility, \["public", "members", "private"\]\)/);
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

test('Public teaser uses an explicit allowlist, excluding private metadata and seller data', () => {
  const car = { id: 'car', year: '1972', make: 'Example', model: 'Coupe', category: 'Classic', expectedPrice: 'confidential', location: 'confidential', sellerEmail: 'confidential', registryId: 'internal', notes: 'confidential', status: 'released', visibility: 'private' };
  assert.deepEqual(registryTeaser(car, '/hero'), { id: 'car', year: '1972', make: 'Example', model: 'Coupe', category: 'Classic', heroImageUrl: '/hero' });
});

test('Public HTML preview has only teaser fields and membership/contact actions', async () => {
  const route = await readFile(new URL('../app/registry/[id]/page.tsx', import.meta.url), 'utf8');
  assert.match(route, /canPreviewRegistryCar\(car\)/);
  assert.match(route, /registryTeaser\(car,/);
  assert.match(route, /if \(!teaser\) notFound\(\)/);
  assert.match(route, /Log in/);
  assert.match(route, /become a member/);
  assert.match(route, /href="\/contact"/);
  assert.doesNotMatch(route, /cars\.(sellerName|sellerPhone|sellerEmail|expectedPrice|location|notes|vin|provenance)/);
});

test('Seller call notes stay staff-only and source documents retain staff authorization', async () => {
  const detail = await readFile(new URL('../app/api/registry/[id]/route.ts', import.meta.url), 'utf8');
  assert.match(detail, /notes: staff \? car.notes : ""/);
  const files = await readFile(new URL('../app/api/files/[id]/route.ts', import.meta.url), 'utf8');
  assert.match(files, /if \(!getAuthenticatedUser\(request\)\) return unauthorized\(\)/);
  assert.match(files, /if \(!canManageCars\(await getOrCreateAccount\(request\)\)\) return forbidden\(\)/);
});
