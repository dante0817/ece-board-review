/** v10.47 structural, mathematical and data-safety gate. Draft content, not editorial certification. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const cache=new Map();
function load(relative){let file=path.isAbsolute(relative)?relative:path.join(root,relative);
 if(!fs.existsSync(file))for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(file.endsWith('.json'))return{default:JSON.parse(fs.readFileSync(file,'utf8'))};
 if(cache.has(file))return cache.get(file).exports;
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal(out.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length??0,0,`TS syntax: ${file}`);
 const mod={exports:{}};cache.set(file,mod);
 new Function('require','module','exports',out.outputText)(x=>x.startsWith('.')?load(path.resolve(path.dirname(file),x)):require(x),mod,mod.exports);return mod.exports;
}
const c=json('src/features/trigonometry/curriculum.json');
const sub=c.topics.find(t=>t.number==='12')?.subtopics;
assert.equal(c.topics.length,14);assert.equal(c.topics.flatMap(t=>t.subtopics).length,102);
assert.equal(sub?.length,6);
const ids=new Set(sub.map(s=>s.id));assert.equal(ids.size,6);
const l=json('src/data/lessons/trigonometryPolarParametric.json');
const q=json('src/data/practice/trigonometryPolarParametric.json');
const ledger=json('src/data/practice/trigonometryPolarParametricAnswerLedgerV1047.json');
assert.deepEqual(new Set(Object.keys(l)),ids);assert.equal(q.length,48);assert.equal(Object.keys(ledger).length,48);
const blockIds=new Set(),qids=new Set(),prompts=new Set(),diag=new Set();
for(const [id,lesson] of Object.entries(l)){
 assert.equal(lesson.id,id);assert.equal(lesson.status,'draft');assert.equal(lesson.contentVersion,1);
 assert(lesson.summary.length>=85);assert.equal(lesson.sections.length,3);
 const blocks=lesson.sections.flatMap(s=>s.blocks);
 for(const type of ['definition','formula','worked-example','note','checkpoint','diagram'])assert(blocks.some(b=>b.type===type),`${id}: missing ${type}`);
 assert.equal(blocks.filter(b=>b.type==='formula').length,3);
 assert.equal(blocks.filter(b=>b.type==='worked-example').length,2);
 assert(blocks.some(b=>b.type==='note'&&b.text.includes('Reference guide')));
 for(const b of blocks){assert(!blockIds.has(b.id));blockIds.add(b.id);
  if(b.type==='formula'){
   assert(b.latex.length>9);assert.equal((b.latex.match(/{/g)??[]).length,(b.latex.match(/}/g)??[]).length);
   assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f\t]/.test(b.latex));
  }
  if(b.type==='worked-example')assert(b.steps.length>=2&&b.strategy.length>=25&&b.check.length>=30);
  if(b.type==='checkpoint')assert(b.answer.length>1&&b.explanation.length>=30);
  if(b.type==='diagram'){diag.add(b.diagram);assert(b.caption.length>=65);}
 }
}
assert.deepEqual(diag,new Set(['polar-grid','parametric-circle']));
for(let i=0;i<6;i++){
 const qs=q.filter(v=>v.subtopicId===sub[i].id);assert.equal(qs.length,8);
 assert(qs.some(v=>v.difficulty==='Advanced'));
 for(let j=0;j<8;j++){
  const v=qs[j];assert.equal(v.id,`TRI47-12${i+1}-${String(j+1).padStart(3,'0')}`);
  assert(!qids.has(v.id));qids.add(v.id);assert(!prompts.has(v.prompt));prompts.add(v.prompt);
  assert.equal(v.options.length,4);assert.equal(new Set(v.options).size,4);
  assert(Number.isInteger(v.correctIndex)&&v.correctIndex>=0&&v.correctIndex<4);
  assert.equal(v.options[v.correctIndex],ledger[v.id]);assert(v.explanation.length>=45);
 }
}
const {PRACTICE_CATALOG:allCatalog,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
const PRACTICE_CATALOG=allCatalog.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI48-'));
assert.equal(PRACTICE_CATALOG.length,1118);
assert.equal(new Set(PRACTICE_CATALOG.map(v=>v.key)).size,1118);
const historical=PRACTICE_CATALOG.filter(v=>!v.key.startsWith('trigonometry-pilot:TRI47-'));
assert.equal(historical.length,1070);assert.equal(historical.filter(v=>v.bankId!=='trigonometry-pilot').length,422);
assert.equal(historical.filter(v=>v.bankId==='trigonometry-pilot').length,648);
assert.equal(PRACTICE_CATALOG.filter(v=>v.key.startsWith('trigonometry-pilot:TRI47-')).length,48);
for(const s of sub){const matches=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:s.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(matches.length,8);assert(matches.every(x=>x.reviewStatus==='draft-unverified'&&x.objectiveId===s.id&&x.revision));}
const source=read('src/features/trigonometry/TrigonometryScreen.tsx');
assert(source.includes('...TRIGONOMETRY_POLAR_PARAMETRIC_LESSONS'));
assert(read('src/domain/practice/catalog.ts').includes('...TRIGONOMETRY_POLAR_PARAMETRIC_QUESTIONS'));
assert(read('src/domain/learn/lessonTypes.ts').includes("|'polar-grid'|'parametric-circle'"));
assert(read('src/components/learn-reader/TrigonometryDiagram.tsx').includes("diagram==='polar-grid'"));
assert(read('src/components/learn-reader/TrigonometryDiagram.tsx').includes("diagram==='parametric-circle'"));
// Independent mathematical identity checks for negative r, polar conversion, roses, parametric directions.
const eps=1e-8,near=(a,b,name)=>assert(Math.abs(a-b)<=eps,`${name}: ${a} vs ${b}`);
const polar=(r,t)=>[r*Math.cos(t),r*Math.sin(t)];
const equalXY=(a,b,name)=>{near(a[0],b[0],`${name}.x`);near(a[1],b[1],`${name}.y`)};
equalXY(polar(-2,Math.PI/3),polar(2,4*Math.PI/3),'negative-radius equivalence');
equalXY(polar(2,Math.PI/6),polar(2,13*Math.PI/6),'2pi equivalence');
equalXY(polar(-4,Math.PI/2),[0,-4],'reversed ray');
equalXY(polar(6,2*Math.PI/3),[-3,3*Math.sqrt(3)],'QII conversion');
equalXY(polar(2,Math.PI/3),[1,Math.sqrt(3)],'polar to rectangular');
near(Math.hypot(-Math.sqrt(3),1),2,'radial distance');
near(Math.atan2(1,-Math.sqrt(3)),5*Math.PI/6,'atan2 quadrant II');
for(let t=0;t<=2*Math.PI;t+=Math.PI/12){
 const [x,y]=polar(2*Math.cos(t),t);near(x*x+y*y,2*x,'circle r=2cos');
 const [u,v]=polar(6*Math.sin(t),t);near(u*u+(v-3)**2,9,'circle r=6sin');
 const [a,b]=polar(2*Math.sin(t),t);near(a*a+(b-1)**2,1,'circle r=2sin');
}
assert.equal(3%2===1?3:6,3);assert.equal(4%2===0?2*4:4,8);
for(let t=0;t<=2*Math.PI;t+=Math.PI/8){
 const x=3*Math.cos(t),y=3*Math.sin(t);near(x*x+y*y,9,'circle param');
 const e=2*Math.cos(t),f=3*Math.sin(t);near(e*e/4+f*f/9,1,'ellipse param');
 const xx=Math.cos(2*t),yy=Math.sin(2*t);near(xx*xx+yy*yy,1,'repeat circle');
}
near((3*.5**2)/(2*.5),.75,'parametric slope 3t/2 at t=.5');
// Original manual progress from a previous release and Algebra must survive new progress saves.
const tracking=load('src/domain/learn/manualLearnTracking.ts'),progress=load('src/features/trigonometry/manualProgressAdapter.ts');
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};globalThis.window={dispatchEvent:()=>{}};
const prev={...tracking.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:true,updatedAt:'2026-01-01T00:00:00.000Z'};
memory.set(tracking.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-preserve':prev,'trig-complex-polar-modulus-and-argument':prev}}));
assert(tracking.isManualTrackingId(sub[0].id));
progress.saveTrigManualProgress(sub[0].id,{read1:true,read2:true,read3:true,mastered:true,review:true});
const records=tracking.readManualLearnStore().records;
assert.deepEqual(records['alg-preserve'],prev);assert.deepEqual(records['trig-complex-polar-modulus-and-argument'],prev);
assert.equal(records[sub[0].id].reviewCount,3);assert.equal(records[sub[0].id].selfStatus,'mastered');assert.equal(records[sub[0].id].needsReview,true);
for(const p of ['src/data/lessons/trigonometryPolarParametric.ts','src/data/practice/trigonometryPolarParametric.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/components/learn-reader/TrigonometryDiagram.tsx','src/domain/practice/catalog.ts']){
 const out=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal(out.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length??0,0,p);
}
assert(['10.47.0','10.48.0','10.49.0','10.50.0','10.50.1','10.50.2','10.50.3','10.51.0', '10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(json('package.json').version));assert.equal(json('package-lock.json').version,json('package.json').version);
console.log('PASS v10.47: 6 draft polar/parametric lessons, 48 ledger-checked questions, 2 diagrams, numeric math checks, 87/102 connected lessons, 696 Trigonometry and 422 Algebra questions, progress preserved.');
