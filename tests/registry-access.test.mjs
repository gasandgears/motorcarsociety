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
      assert.equal(canViewRegistryCar(car, false, true), status === 'released' && ['public', 'members', 'private'].includes(visibility));
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

test('Approved member listing and media access does not require a paid tier', async () => {
  for (const path of ['../app/api/registry/route.ts', '../app/api/registry/[id]/route.ts', '../app/api/registry/[id]/photos/[fileId]/route.ts']) {
    const route = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(route, /paidMember|Paid membership required|slice\(0, 5\)/);
  }
});

async function loadRoute(path, account, rows, authenticated = true) {
  const raw = await readFile(new URL(path, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(raw, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText.replace(/^import .*;\n/gm, '');
  const depsKey = `registryTest${Math.random().toString(36).slice(2)}`;
  const schema = new Proxy({}, { get: (_, key) => key });
  const db = { select() {
    const query = new Proxy({}, { get: (_, key) => key === 'then' ? (resolve) => resolve(rows.shift() || []) : () => query });
    return query;
  } };
  globalThis[depsKey] = {
    canViewRegistryCar, canPreviewRegistryCar, getDb: () => db, cars: schema, carFiles: schema,
    and: (...args) => args, asc: x => x, eq: (...args) => args, inArray: (...args) => args,
    getAuthenticatedUser: () => authenticated ? { id: 'fixture-user' } : null,
    getOrCreateAccount: async () => account,
    unauthorized: () => Response.json({ error: 'Sign in' }, { status: 401 }),
    serverError: () => Response.json({ error: 'Unexpected fixture error' }, { status: 500 }),
    getBucket: () => ({ get: async () => ({ body: 'fixture-media', writeHttpMetadata: h => h.set('Content-Type', 'image/jpeg') }) }),
  };
  const prefix = `const {canViewRegistryCar,canPreviewRegistryCar,getDb,cars,carFiles,and,asc,eq,inArray,getAuthenticatedUser,getOrCreateAccount,unauthorized,serverError,getBucket} = globalThis[${JSON.stringify(depsKey)}];\n`;
  try { return await import(`data:text/javascript;base64,${Buffer.from(prefix + compiled).toString('base64')}`); }
  finally { delete globalThis[depsKey]; }
}

test('Actual detail handler gives free approved members all released Private Match listing media and price', async () => {
  const car = { id: 'fixture', status: 'released', visibility: 'private', expectedPrice: 'price-fixture', location: 'location-fixture', notes: 'seller-call-fixture' };
  const photos = Array.from({ length: 8 }, (_, i) => ({ id: String(i), category: i ? 'photos' : 'hero', createdAt: i }));
  const route = await loadRoute('../app/api/registry/[id]/route.ts', { role: 'member', status: 'approved', tier: 'free' }, [[car], photos, [{ id: 'video', contentType: 'video/mp4' }]]);
  const response = await route.GET(new Request('https://fixture.test'), { params: Promise.resolve({ id: 'fixture' }) });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.car.expectedPrice, 'price-fixture');
  assert.equal(data.car.location, 'location-fixture');
  assert.equal(data.car.notes, '');
  assert.equal(data.photos.length, 8);
  assert.equal(data.videos.length, 1);
  assert.equal(data.access, 'member');
});

test('Actual detail handler rejects anonymous, pending and unreleased member access while preserving staff', async () => {
  for (const [account, authenticated, status, expected] of [
    [null, false, 'released', 401],
    [{ role: 'member', status: 'pending' }, true, 'released', 403],
    [{ role: 'member', status: 'approved', tier: 'free' }, true, 'intake', 403],
    [{ role: 'admin', status: 'approved' }, true, 'intake', 200],
  ]) {
    const route = await loadRoute('../app/api/registry/[id]/route.ts', account, [[{ id: 'fixture', status, visibility: 'private' }], [], []], authenticated);
    const response = await route.GET(new Request('https://fixture.test'), { params: Promise.resolve({ id: 'fixture' }) });
    assert.equal(response.status, expected);
  }
});

test('Actual media handler permits full gallery for approved free member and only hero for visitors', async () => {
  for (const [account, category, expected] of [
    [{ role: 'member', status: 'approved', tier: 'free' }, 'photos', 200],
    [null, 'photos', 403],
    [null, 'hero', 200],
  ]) {
    const route = await loadRoute('../app/api/registry/[id]/photos/[fileId]/route.ts', account, [[{ status: 'released', visibility: 'private' }], [{ category, contentType: 'image/jpeg', storageKey: 'fixture' }]], Boolean(account));
    const response = await route.GET(new Request('https://fixture.test'), { params: Promise.resolve({ id: 'fixture', fileId: 'photo' }) });
    assert.equal(response.status, expected);
  }
});
