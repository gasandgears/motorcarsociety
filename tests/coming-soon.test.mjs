import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
async function moduleFrom(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const { validateCarInquiry } = await moduleFrom('../lib/inquiry-validation.ts');
const now = Date.now();
const valid = { carId: '11111111-1111-4111-8111-111111111111', name: 'Fixture Person', phone: '+1 555 010 1234', email: 'fixture@example.invalid', consent: true, startedAt: now - 5000 };
test('Inquiry validation requires identity, contact consent and basic spam checks', () => {
  assert.equal(validateCarInquiry(valid, now).value.email, valid.email);
  for (const change of [{ email: 'invalid' }, { phone: '123' }, { consent: false }, { carId: '-'.repeat(36) }, { startedAt: now }, { name: '' }]) assert.ok(validateCarInquiry({ ...valid, ...change }, now).error);
  assert.equal(validateCarInquiry({ ...valid, website: 'bot.invalid' }, now).spam, true);
});
test('Coming Soon exposes only explicitly enabled titles and selected hero covers; release removes them', async () => {
  const source = await readFile(new URL('../lib/coming-soon.ts', import.meta.url), 'utf8');
  assert.match(source, /\["intake", "review", "ready"\]/);
  assert.match(source, /eq\(comingSoonPreviews.enabled, true\)/);
  assert.match(source, /eq\(carFiles.category, "hero"\)/);
  assert.doesNotMatch(source, /cars\.(notes|sellerName|sellerEmail|sellerPhone|location|expectedPrice|vin|overview)/);
  const cover = await readFile(new URL('../app/api/coming-soon/[id]/cover/route.ts', import.meta.url), 'utf8');
  assert.match(cover, /eq\(comingSoonPreviews.enabled, true\)/);
  assert.match(cover, /inArray\(cars.status, comingSoonStatuses\)/);
});
test('Inquiry endpoint checks real preview membership and persistent limits before saving', async () => {
  const source = await readFile(new URL('../app/api/car-inquiries/route.ts', import.meta.url), 'utf8');
  assert.match(source, /get\("origin"\) !== new URL\(request.url\).origin/);
  assert.match(source, /db.transaction/);
  assert.match(source, /pg_advisory_xact_lock/);
  assert.match(source, /eq\(comingSoonPreviews.enabled, true\)/);
  assert.match(source, /inArray\(cars.status, comingSoonStatuses\)/);
  assert.match(source, /status: 429/);
  assert.match(source, /notification: sent \? "sent" : "pending"/);
  assert.doesNotMatch(source, /mailingContacts|confirmed_opt_in/);
});
test('New preview and inquiry tables are inaccessible through public Data API roles', async () => {
  const sql = await readFile(new URL('../supabase/migrations/20261103195015_coming_soon_inquiries.sql', import.meta.url), 'utf8');
  for (const table of ['coming_soon_previews', 'car_inquiries']) assert.match(sql, new RegExp(`alter table public.${table} enable row level security`));
  assert.match(sql, /revoke all on public.coming_soon_previews,public.car_inquiries from anon, authenticated/);
});
test('Cards open an inquiry dialog without linking to unreleased details; newsletter consent stays separate', async () => {
  const source = await readFile(new URL('../components/coming-soon.tsx', import.meta.url), 'utf8');
  assert.match(source, /To learn more about this car/);
  assert.match(source, /setSelected\(car\)/);
  assert.doesNotMatch(source, /href=.*registry\//);
  assert.match(source, /does not subscribe me to a newsletter/);
  assert.match(source, /Email notification is delayed/);
});
test('Notification sender fails truthfully when unconfigured and uses verified business recipient when accepted', async () => {
  const { notifyCarInquiry, inquiryRecipient } = await moduleFrom('../lib/inquiry-notifications.ts');
  const oldKey = process.env.RESEND_API_KEY, oldFrom = process.env.INQUIRY_EMAIL_FROM, oldFetch = globalThis.fetch;
  try {
    delete process.env.RESEND_API_KEY; delete process.env.INQUIRY_EMAIL_FROM;
    let requests = 0;
    globalThis.fetch = async (_url, options) => { requests++; const body = JSON.parse(options.body); assert.deepEqual(body.to, [inquiryRecipient]); assert.equal(body.reply_to, valid.email); assert.match(body.text, /not newsletter consent/); return { ok: true }; };
    const inquiry = { ...valid, id: 'fixture', carTitle: 'Fixture car' };
    assert.equal(await notifyCarInquiry(inquiry), false); assert.equal(requests, 0);
    process.env.RESEND_API_KEY = 'fixture-key'; process.env.INQUIRY_EMAIL_FROM = 'fixture@example.invalid';
    assert.equal(await notifyCarInquiry(inquiry), true); assert.equal(requests, 1);
    globalThis.fetch = async () => ({ ok: false });
    assert.equal(await notifyCarInquiry(inquiry), false);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = oldKey;
    if (oldFrom === undefined) delete process.env.INQUIRY_EMAIL_FROM; else process.env.INQUIRY_EMAIL_FROM = oldFrom;
  }
});

async function inquiryRoute(rows, notified = false) {
  const source = await readFile(new URL('../app/api/car-inquiries/route.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText.replace(/^import .*;\n/gm, '');
  const saved = [], notifications = [];
  const schema = new Proxy({}, { get: (_, key) => key });
  const tx = {
    execute: async () => {},
    select() { const q = new Proxy({}, { get: (_, key) => key === 'then' ? resolve => resolve(rows.shift() || []) : () => q }); return q; },
    insert: () => ({ values: async value => { saved.push(value); } }),
  };
  const db = { transaction: async fn => fn(tx), update: () => ({ set: () => ({ where: async () => {} }) }) };
  const { readPublicForm } = await moduleFrom('../lib/public-form.ts');
  const key = `inquiryRoute${Math.random().toString(36).slice(2)}`;
  globalThis[key] = { readPublicForm, validateCarInquiry, createHash: () => ({ update: () => ({ digest: () => 'fixture-hash' }) }), and: (...x) => x, count: () => 0, eq: (...x) => x, gt: (...x) => x, sql: (...x) => x, inArray: (...x) => x, getDb: () => db, cars: schema, carFiles: schema, carInquiries: schema, comingSoonPreviews: schema, comingSoonStatuses: ['intake','review','ready'], notifyCarInquiry: async inquiry => { notifications.push(inquiry); return notified; } };
  const prefix = `const {readPublicForm,validateCarInquiry,createHash,and,count,eq,gt,sql,inArray,getDb,cars,carFiles,carInquiries,comingSoonPreviews,comingSoonStatuses,notifyCarInquiry}=globalThis[${JSON.stringify(key)}];\n`;
  try { return { route: await import(`data:text/javascript;base64,${Buffer.from(prefix + js).toString('base64')}`), saved, notifications }; } finally { delete globalThis[key]; }
}
function inquiryRequest(body, origin = 'https://fixture.test') { return new Request('https://fixture.test/api/car-inquiries', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) }); }
test('Actual inquiry handler saves a car-specific lead, independently of email delivery', async () => {
  const { route, saved, notifications } = await inquiryRoute([[{title:'Fixture car'}],[],[{value:0}],[{value:0}]]);
  const response = await route.POST(inquiryRequest(valid));
  assert.equal(response.status, 201); assert.equal((await response.json()).notification, 'pending');
  assert.equal(saved.length, 1); assert.equal(saved[0].carId, valid.carId); assert.equal(saved[0].carTitle, 'Fixture car');
  assert.equal(saved[0].notificationStatus, 'pending'); assert.equal(notifications.length, 1);
});
test('Actual inquiry handler blocks unavailable cars, bad origins and persistent rate limit excess', async () => {
  for (const [rows, body, origin, status] of [[[],valid,'https://fixture.test',409], [[[{title:'Fixture car'}],[],[{value:5}],[{value:0}]],valid,'https://fixture.test',429], [[],valid,'https://other.invalid',403], [[],{...valid,consent:false},'https://fixture.test',400]]) {
    const { route, saved, notifications } = await inquiryRoute(rows);
    const response = await route.POST(inquiryRequest(body, origin)); assert.equal(response.status, status); assert.equal(saved.length, 0); assert.equal(notifications.length, 0);
  }
});
test('Actual inquiry handler deduplicates repeated inquiries without sending twice', async () => {
  const { route, saved, notifications } = await inquiryRoute([[{title:'Fixture car'}],[{notificationStatus:'sent'}]]);
  const response = await route.POST(inquiryRequest(valid)); assert.equal(response.status,200); assert.equal((await response.json()).notification,'sent'); assert.equal(saved.length,0); assert.equal(notifications.length,0);
});
