import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../components/public-analytics.tsx', import.meta.url), 'utf8');
function harness({ consent = null, path = '/', referrer = '', dnt = '', gpc = false, host = 'www.collectorlegacy.com' } = {}) {
  const effects = [], scripts = [], ref = { current: null };
  const location = { pathname: path, hostname: host, reload() {} };
  const window = { addEventListener() {}, removeEventListener() {} };
  const document = { referrer, createElement: () => ({}), head: { appendChild: s => scripts.push(s) } };
  const exports = {};
  const context = { exports, window, document, location, navigator: { doNotTrack: dnt, globalPrivacyControl: gpc }, localStorage: { getItem: () => consent, setItem: (_k,v) => { consent = v; } }, URL, Date, queueMicrotask: () => {},
    require: n => n === 'react' ? { useEffect: f => effects.push(f), useRef: () => ref, useState: v => [v, () => {}] } : n === 'next/navigation' ? { usePathname: () => location.pathname } : { jsx: () => null, jsxs: () => null } };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, context);
  function render() { effects.length = 0; exports.PublicAnalytics(); effects.forEach(f => f()); }
  return { render, scripts, window, location, document };
}
test('off by default, on private routes, previews and privacy signals', () => {
  for (const options of [{}, {consent:'no'}, {consent:'yes',path:'/admin/members'}, {consent:'yes',path:'/cars/private-vin'}, {consent:'yes',host:'preview.vercel.app'}, {consent:'yes',dnt:'1'}, {consent:'yes',gpc:true}]) {
    const h = harness(options); h.render(); assert.equal(h.scripts.length,0);
  }
});
test('one manual GA pageview per navigation, singleton scripts', () => {
  const h = harness({consent:'yes'}); h.render(); h.render();
  assert.equal(h.scripts.length,2);
  const events = () => h.window.dataLayer.filter(x => x[0] === 'event');
  assert.equal(events().length,1);
  assert.equal(events()[0][2].page_location,'https://www.collectorlegacy.com/');
  assert.equal(events()[0][2].page_referrer,'');
  h.location.pathname='/about'; h.render(); assert.equal(events().length,2);
  assert.equal(h.window.dataLayer.filter(x => x[0] === 'config').length, 1);
  const latestSet = h.window.dataLayer.filter(x => x[0] === 'set').at(-1)[1];
  assert.equal(latestSet.send_page_view, false);
  assert.equal(latestSet.allow_enhanced_conversions, false);
  assert.equal(latestSet.page_location, 'https://www.collectorlegacy.com/about');
  h.location.pathname='/admin'; h.render(); assert.equal(h.window['ga-disable-G-HXR3LSPNKL'],true);
  h.location.pathname='/about'; h.render(); assert.equal(events().length,3);
});
test('Vercel filter strips query/hash and blocks private, custom and sensitive referrer events', () => {
  const h = harness({consent:'yes'}); h.render();
  const filter=h.window.vaq.find(x=>x[0]==='beforeSend')[1];
  assert.equal(filter({type:'pageview',url:'https://www.collectorlegacy.com/?email=secret#vin'}).url,'https://www.collectorlegacy.com/');
  assert.equal(filter({type:'pageview',url:'https://www.collectorlegacy.com/cars/private-vin'}),null);
  assert.equal(filter({type:'event',url:'https://www.collectorlegacy.com/'}),null);
  h.location.pathname='/signin';
  assert.equal(filter({type:'pageview',url:'https://www.collectorlegacy.com/'}),null);
  h.location.pathname='/';
  h.document.referrer='https://example.com/?email=private';
  assert.equal(filter({type:'pageview',url:'https://www.collectorlegacy.com/'}),null);
});
