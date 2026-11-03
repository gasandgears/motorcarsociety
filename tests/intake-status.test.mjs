import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
async function patchRoute(currentStatus) {
  const raw=await readFile(new URL('../app/api/cars/[id]/route.ts',import.meta.url),'utf8');
  const js=ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText.replace(/^import .*;\n/gm,'');
  let changes;
  const db={update:()=>({set:value=>{changes=value;return {where:()=>({returning:async()=>[{id:'fixture',status:currentStatus,...value}]})};}})};
  const key=`intakeStatus${Math.random().toString(36).slice(2)}`;
  globalThis[key]={getDb:()=>db,cars:{id:'id'},carFiles:{},asc:x=>x,eq:(...x)=>x,canManageCars:()=>true,getAuthenticatedUser:()=>({id:'staff'}),getOrCreateAccount:async()=>({role:'admin',status:'approved'}),cleanText:(v,max)=>typeof v==='string'?v.trim().slice(0,max):'',forbidden:()=>new Response(null,{status:403}),unauthorized:()=>new Response(null,{status:401}),serverError:()=>new Response(null,{status:500})};
  const prefix=`const {${Object.keys(globalThis[key]).join(',')}}=globalThis[${JSON.stringify(key)}];\n`;
  try{return {route:await import(`data:text/javascript;base64,${Buffer.from(prefix+js).toString('base64')}`),changes:()=>changes};}finally{delete globalThis[key];}
}
function request(body){return new Request('https://fixture.test/api/cars/fixture',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(body)});}
test('Ordinary edits preserve the existing review, ready and released states',async()=>{
  for(const status of ['intake','review','ready','released']){
    const fixture=await patchRoute(status);
    const response=await fixture.route.PATCH(request({make:'Fixture',model:'Car',visibility:'private',received:['hero','photos']}),{params:Promise.resolve({id:'fixture'})});
    assert.equal(response.status,200);assert.equal((await response.json()).car.status,status);assert.equal(Object.hasOwn(fixture.changes(),'status'),false);
  }
});
test('An explicit workflow action can change status and invalid status does not silently reset it',async()=>{
  const explicit=await patchRoute('intake');const response=await explicit.route.PATCH(request({make:'Fixture',status:'review'}),{params:Promise.resolve({id:'fixture'})});assert.equal((await response.json()).car.status,'review');
  const invalid=await patchRoute('released');const rejected=await invalid.route.PATCH(request({status:'invalid'}),{params:Promise.resolve({id:'fixture'})});assert.equal(rejected.status,400);assert.equal(invalid.changes(),undefined);
});
test('Header hero upload is available without navigating and autosave paths omit forced intake status',async()=>{
  const source=await readFile(new URL('../app/motorcar-app.tsx',import.meta.url),'utf8');
  const header=source.slice(source.indexOf('Saved inventory file'),source.indexOf('aria-label="Car intake progress"'));
  assert.match(header,/aria-label="Upload finished hero"/);assert.match(header,/handleUploads\(event.target.files, "hero"\)/);
  assert.match(source,/const saveCar = async \(status\?: string,/);
  assert.doesNotMatch(source,/saveCar\("intake"|visibility, status: "intake"/);
  assert.match(source,/saveCar\("review"\)/);
});
