import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
import { z } from 'zod';
async function load(path, deps) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText.replace(/^import .*;\n/gm, '');
  const key = `visitorTest${Math.random().toString(36).slice(2)}`; globalThis[key] = deps;
  const prefix = `const {${Object.keys(deps).join(',')}}=globalThis[${JSON.stringify(key)}];\n`;
  try { return await import(`data:text/javascript;base64,${Buffer.from(prefix+js).toString('base64')}`); } finally { delete globalThis[key]; }
}
const { visitorSignupInput } = await load('../lib/visitor-signup.ts', {z});
const { readPublicForm } = await load('../lib/public-form.ts', {});
const input = { name:'Fixture Person', email:'Fixture@Example.invalid', phone:'', consent:true, website:'', startedAt:Date.now()-5000 };
function req(body, origin='https://fixture.test') { return new Request('https://fixture.test/api/newsletter',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)}); }
test('Newsletter signup validates explicit consent, optional phone and normalized email',()=>{
  assert.equal(visitorSignupInput.parse(input).email,'fixture@example.invalid');
  for(const patch of [{consent:false},{email:'invalid'},{phone:'bad'},{name:''}]) assert.equal(visitorSignupInput.safeParse({...input,...patch}).success,false);
});
test('Server gate never renders popup for a session or unresolved auth; visitor status fails closed', async()=>{
  for(const [user,error,expected] of [[{id:'member'},null,false],[null,{name:'NetworkError'},false],[null,{name:'AuthSessionMissingError'},true]]) {
    const deps={createUserClient:async()=>({auth:{getUser:async()=>({data:{user},error})}}),VisitorSignup:'fixture-dialog',_jsx:(type)=>({type})};
    const gate=await load('../components/visitor-signup-gate.tsx',deps);
    assert.equal(Boolean(await gate.VisitorSignupGate()),expected);
    const status=await load('../app/api/visitor-status/route.ts',deps);
    assert.equal((await (await status.GET()).json()).eligible,expected);
  }
});
async function newsletterRoute(existing) {
  const contacts=new Map(existing?[['fixture@example.invalid',existing]]:[]),attempts=[];
  let lock=Promise.resolve();
  const tx={ execute:async()=>{},select:()=>({from:()=>({where:async()=>[{value:attempts.length}]})}),insert:table=>({values:value=>table==='attempts'?(attempts.push(value),Promise.resolve()):({onConflictDoNothing:async()=>{if(!contacts.has(value.email))contacts.set(value.email,value);}})})};
  const db={transaction:fn=>{const run=lock.then(()=>fn(tx));lock=run.catch(()=>{});return run;}};
  const route=await load('../app/api/newsletter/route.ts',{createHash:()=>({update:()=>({digest:()=> 'fixture-ip'})}),and:(...x)=>x,count:()=>0,eq:(...x)=>x,gt:(...x)=>x,sql:(...x)=>x,getDb:()=>db,mailingContacts:'contacts',newsletterSignupAttempts:'attempts',visitorSignupInput,readPublicForm});
  return {route,contacts,attempts};
}
test('Actual signup route persists consent without creating membership or returning contact data',async()=>{
  const {route,contacts}=await newsletterRoute();const response=await route.POST(req(input));
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{saved:true});
  const row=contacts.get('fixture@example.invalid');assert.equal(row.permission,'confirmed_opt_in');assert.equal(row.inviteStatus,'not_sent');assert.equal(row.source,'registry-newsletter-popup-v1');
});
test('Concurrent duplicate signups preserve existing contacts and unsubscribe decisions',async()=>{
  const existing={permission:'unsubscribed',displayName:'Original',phone:'original'};
  const {route,contacts}=await newsletterRoute(existing);
  await Promise.all([route.POST(req(input)),route.POST(req({...input,name:'Other'}))]);
  assert.equal(contacts.size,1);assert.deepEqual(contacts.get('fixture@example.invalid'),existing);
  const fresh=await newsletterRoute();await Promise.all([fresh.route.POST(req(input)),fresh.route.POST(req(input))]);assert.equal(fresh.contacts.size,1);
});
test('Signup rejects cross-origin and unconsented submissions, bounds body size and rate limits',async()=>{
  const {route,contacts}=await newsletterRoute();
  assert.equal((await route.POST(req(input,'https://other.invalid'))).status,403);
  assert.equal((await route.POST(req({...input,consent:false}))).status,400);
  assert.equal((await route.POST(req({...input,name:'x'.repeat(5000)}))).status,400);assert.equal(contacts.size,0);
  for(let i=0;i<5;i++)assert.equal((await route.POST(req(input))).status,200);
  assert.equal((await route.POST(req(input))).status,429);
});
test('Popup starts closed, waits for eligibility, closes on auth and remembers Cancel; contacts stay admin-only',async()=>{
  const source=await readFile(new URL('../components/visitor-signup.tsx',import.meta.url),'utf8');
  assert.match(source,/\[open, setOpen\] = useState\(false\)/);assert.match(source,/status\?\.eligible === true/);assert.match(source,/onAuthStateChange/);assert.match(source,/session\?\.user/);assert.match(source,/localStorage.setItem/);assert.match(source,/Cancel — continue browsing/);
  const route=await readFile(new URL('../app/api/admin/contacts/route.ts',import.meta.url),'utf8');assert.match(route,/if \(!isAdmin\(await getOrCreateAccount\(request\)\)\) return forbidden\(\)/);
});
