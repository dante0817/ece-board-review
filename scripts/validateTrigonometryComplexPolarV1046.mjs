/** Topic 11 mathematical and integration quality gate: automated checks, NOT editorial certification. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const cache=new Map();
function load(relative){let abs=path.isAbsolute(relative)?relative:path.join(root,relative);
 if(!fs.existsSync(abs))for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(abs+ext)){abs+=ext;break;}
 if(abs.endsWith('.json'))return{default:JSON.parse(fs.readFileSync(abs,'utf8'))};
 if(cache.has(abs))return cache.get(abs).exports;
 const result=ts.transpileModule(fs.readFileSync(abs,'utf8'),{fileName:abs,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,abs);
 const mod={exports:{}};cache.set(abs,mod);
 new Function('require','module','exports',result.outputText)(x=>x.startsWith('.')?load(path.resolve(path.dirname(abs),x)):require(x),mod,mod.exports);
 return mod.exports;
}
const c=json('src/features/trigonometry/curriculum.json');
assert.equal(c.topics.length,14);assert.equal(c.topics.flatMap(x=>x.subtopics).length,102);
const topic=c.topics.find(x=>x.number==='11');assert(topic);
const ss=topic.subtopics, ids=new Set(ss.map(x=>x.id));assert.equal(ids.size,8);
const L=json('src/data/lessons/trigonometryComplexPolar.json');
const Q=json('src/data/practice/trigonometryComplexPolar.json');
const ledger=json('src/data/practice/trigonometryComplexPolarAnswerLedgerV1046.json');
assert.deepEqual(new Set(Object.keys(L)),ids);assert.equal(Q.length,64);assert.equal(Object.keys(ledger).length,64);
const allBlocks=new Set(),allQs=new Set(),allPrompts=new Set();const diagSet=new Set();
for(const [id,lesson] of Object.entries(L)){
 assert(ids.has(id));assert.equal(lesson.id,id);assert.equal(lesson.status,'draft');assert.equal(lesson.contentVersion,1);
 assert(lesson.summary.length>=85);assert.equal(lesson.sections.length,3);
 const blocks=lesson.sections.flatMap(s=>s.blocks);
 for(const type of ['definition','formula','worked-example','checkpoint','note','diagram'])assert(blocks.some(x=>x.type===type),`${id} missing ${type}`);
 assert.equal(blocks.filter(x=>x.type==='formula').length,3);
 assert.equal(blocks.filter(x=>x.type==='worked-example').length,2);
 assert(blocks.some(x=>x.type==='note'&&x.text.includes('Reference guide')));
 for(const b of blocks){assert(!allBlocks.has(b.id));allBlocks.add(b.id);
  if(b.type==='formula'){
   assert(b.latex.length>11);assert.equal((b.latex.match(/{/g)||[]).length,(b.latex.match(/}/g)||[]).length);
   assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f\t]/.test(b.latex),`illegal escape in ${b.id}`);
  }
  if(b.type==='worked-example'){assert(b.strategy.length>22);assert(b.steps.length>=2);assert(b.check.length>=28);}
  if(b.type==='checkpoint'){assert(b.answer.length>0&&b.explanation.length>=35);}
  if(b.type==='diagram'){assert(['complex-plane','roots-of-unity'].includes(b.diagram));diagSet.add(b.diagram);assert(b.caption.length>60);}
 }
}
assert.deepEqual(diagSet,new Set(['complex-plane','roots-of-unity']));
// Independent answer ledger: not the catalog's correctIndex or display order. Mathematical spot checks follow.
for(let i=0;i<8;i++){
 const qs=Q.filter(q=>q.subtopicId===ss[i].id);assert.equal(qs.length,8);
 assert(qs.some(q=>q.difficulty==='Advanced'));
 for(let j=0;j<8;j++){
  const q=qs[j];assert.equal(q.id,`TRI46-11${i+1}-${String(j+1).padStart(3,'0')}`);
  assert(!allQs.has(q.id));allQs.add(q.id);assert(!allPrompts.has(q.prompt));allPrompts.add(q.prompt);
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4);
  assert.equal(q.options[q.correctIndex],ledger[q.id],q.id);
  assert(q.explanation.length>=42,`Insufficient explanation ${q.id}`);
  assert(['Basic','Intermediate','Advanced'].includes(q.difficulty));
 }
}
const {PRACTICE_CATALOG: allCatalog,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
const PRACTICE_CATALOG=allCatalog.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI47-')&&!q.key.startsWith('trigonometry-pilot:TRI48-')); 
assert.equal(PRACTICE_CATALOG.length,1070,'Expected 422 Algebra + 648 Trigonometry entries');
assert.equal(new Set(PRACTICE_CATALOG.map(x=>x.key)).size,PRACTICE_CATALOG.length);
const prev=PRACTICE_CATALOG.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI46-'));
assert.equal(prev.length,1006,'Historical question bank count must not change');
assert.equal(prev.filter(x=>x.bankId!=='trigonometry-pilot').length,422);
assert.equal(prev.filter(x=>x.bankId==='trigonometry-pilot').length,584);
assert.equal(PRACTICE_CATALOG.filter(x=>x.bankId==='trigonometry-pilot').length,648);
assert.equal(PRACTICE_CATALOG.filter(x=>x.key.startsWith('trigonometry-pilot:TRI46-')).length,64);
for(const st of ss){const f=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:st.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(f.length,8);assert(f.every(x=>x.reviewStatus==='draft-unverified'&&x.revision&&x.objectiveId===st.id));}
const source=read('src/features/trigonometry/TrigonometryScreen.tsx'),catalogSource=read('src/domain/practice/catalog.ts');
assert(source.includes('...TRIGONOMETRY_COMPLEX_POLAR_LESSONS'));
assert(catalogSource.includes('...TRIGONOMETRY_COMPLEX_POLAR_QUESTIONS'));
assert(read('src/domain/learn/lessonTypes.ts').includes("|'roots-of-unity'"));
assert(read('src/components/learn-reader/TrigonometryDiagram.tsx').includes("diagram==='roots-of-unity'"));
// Independent calculation checks include quadrants, conjugates, Euler, powers and ALL roots.
const eps=1e-9,near=(a,b,name)=>assert(Math.abs(a-b)<eps,`${name}: ${a} vs ${b}`);
const add=([a,b],[c,d])=>[a+c,b+d];const mul=([a,b],[c,d])=>[a*c-b*d,a*d+b*c];
const div=(a,b)=>mul(a,[b[0]/(b[0]**2+b[1]**2),-b[1]/(b[0]**2+b[1]**2)]);
const polar=(r,t)=>[r*Math.cos(t),r*Math.sin(t)];
const cmul=(z,n)=>{let w=[1,0];for(let k=0;k<n;k++)w=mul(w,z);return w;};
const znear=(a,b,name)=>{near(a[0],b[0],name+' Re');near(a[1],b[1],name+' Im')};
const deg=x=>x*Math.PI/180;
znear(mul([2,1],[1,-3]),[5,-5],'rectangular product');
znear(div([4,2],[1,1]),[3,-1],'rectangular quotient');
znear(div([-1,0],[0,1]),[0,1],'divide -1 by i');
znear(add([-1,2],[3,-5]),[2,-3],'complex addition');
znear(mul([2,-3],[2,3]),[13,0],'conjugate multiplication');
near(Math.hypot(-3,4),5,'modulus');near(Math.atan2(4,-3),Math.PI-Math.atan2(4,3),'quadrant II');
near(Math.atan2(-1,-1),-3*Math.PI/4,'principal quadrant III');
near(Math.atan2(3*Math.sqrt(3),-3),2*Math.PI/3,'principal quadrant II 120');
znear(polar(Math.SQRT2,3*Math.PI/4),[-1,1],'polar to rectangular');
znear(polar(8,Math.PI/6),[4*Math.sqrt(3),4],'30 degree conversion');
znear(polar(2,deg(30+40)),mul(polar(2,deg(30)),polar(1,deg(40))),'angle addition');
znear(mul(polar(2,deg(30)),polar(3,deg(75))),polar(6,deg(105)),'polar product');
znear(div(polar(8,deg(150)),polar(2,deg(-30))),polar(4,deg(180)),'polar quotient');
znear(polar(1,Math.PI),[-1,0],'Euler pi');znear(polar(1,Math.PI/2),[0,1],'Euler pi/2');
znear(cmul([1,1],4),[-4,0],'De Moivre fourth');znear(cmul(polar(2,deg(20)),3),polar(8,deg(60)),'De Moivre cubic');
const roots=Array.from({length:3},(_,k)=>polar(2,2*Math.PI*k/3));
for(const [k,r] of roots.entries())znear(cmul(r,3),[8,0],`cube root #${k}`);
for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert(Math.hypot(roots[i][0]-roots[j][0],roots[i][1]-roots[j][1])>1);
const fourth=Array.from({length:4},(_,k)=>polar(2,(Math.PI+2*Math.PI*k)/4));
for(const [k,r] of fourth.entries())znear(cmul(r,4),[-16,0],`fourth root #${k}`);
// Saved study records for Algebra and an earlier Trigonometry topic must survive new progress.
const track=load('src/domain/learn/manualLearnTracking.ts'),progress=load('src/features/trigonometry/manualProgressAdapter.ts');
const m=new Map();globalThis.localStorage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};globalThis.window={dispatchEvent:()=>{}};
const old={...track.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:true,updatedAt:'2026-01-01T00:00:00.000Z'};
m.set(track.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-preserve':old,'trig-vectors-scalars-and-vectors':old}}));
assert(track.isManualTrackingId(ss[0].id));progress.saveTrigManualProgress(ss[0].id,{read1:true,read2:true,read3:true,mastered:true,review:true});
const records=track.readManualLearnStore().records;assert.deepEqual(records['alg-preserve'],old);assert.deepEqual(records['trig-vectors-scalars-and-vectors'],old);
assert.equal(records[ss[0].id].reviewCount,3);assert.equal(records[ss[0].id].selfStatus,'mastered');assert.equal(records[ss[0].id].needsReview,true);
for(const f of ['src/data/lessons/trigonometryComplexPolar.ts','src/data/practice/trigonometryComplexPolar.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/components/learn-reader/TrigonometryDiagram.tsx','src/domain/practice/catalog.ts']){
 const m=ts.transpileModule(read(f),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((m.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,f);
}
assert(['10.47.0','10.48.0','10.49.0','10.50.0','10.50.1','10.50.2','10.50.3','10.51.0', '10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(json('package.json').version));assert.equal(json('package-lock.json').version,json('package.json').version);
console.log('PASS v10.46: 8 draft complex/polar lessons, 64 answer-ledger checked questions, Euler/De Moivre/phase/roots math, 2 diagram types, 81/102 lessons, 648 Trigonometry + 422 Algebra practice, preserved progress.');
