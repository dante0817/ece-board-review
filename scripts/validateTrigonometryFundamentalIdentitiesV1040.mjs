/** v10.40.0 targeted source and mathematical invariant checks. Editorial sign-off is separate. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..');
const read=(f)=>fs.readFileSync(path.join(root,f),'utf8');
const json=(f)=>JSON.parse(read(f));
const cache=new Map();
function load(f){let p=path.resolve(root,f);if(!fs.existsSync(p)){for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(p+ext)){p+=ext;break;}}
 if(p.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(p,'utf8'))};
 if(cache.has(p))return cache.get(p).exports;
 const comp=ts.transpileModule(fs.readFileSync(p,'utf8'),{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((comp.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,'syntax '+p);
 const module={exports:{}};cache.set(p,module);new Function('require','module','exports',comp.outputText)(n=>n.startsWith('.')?load(path.resolve(path.dirname(p),n)):require(n),module,module.exports);return module.exports;
}
const cur=json('src/features/trigonometry/curriculum.json');
const allSubtopics=cur.topics.flatMap(t=>t.subtopics);
const idSet=new Set(allSubtopics.map(s=>s.id));
assert.equal(cur.topics.length,14);assert.equal(allSubtopics.length,102);assert.equal(idSet.size,102);
const topic05=cur.topics.find(t=>t.number==='05');assert.equal(topic05.subtopics.length,6);
const focus=new Set(topic05.subtopics.filter(s=>s.number!=='05.3').map(s=>s.id));
const lessons=json('src/data/lessons/trigonometryFundamentalIdentities.json');
const items=json('src/data/practice/trigonometryFundamentalIdentities.json');
const ledger=json('src/data/practice/trigonometryFundamentalIdentitiesAnswerLedgerV1040.json');
assert.equal(Object.keys(lessons).length,5);assert.equal(items.length,40);assert.equal(Object.keys(ledger).length,40);
assert.equal(new Set(Object.keys(lessons)).size,5);
assert.deepEqual(new Set(Object.keys(lessons)),focus);
const existingPilot=load('src/data/lessons/trigonometryPilot.ts').TRIGONOMETRY_PILOT_LESSONS;
const existingFoundation=load('src/data/lessons/trigonometryFoundations.ts').TRIGONOMETRY_FOUNDATIONS_LESSONS;
const existingCompletion=json('src/data/lessons/trigonometryFoundationCompletion.json');
const allLessons={...existingPilot,...existingFoundation,...existingCompletion,...lessons};
assert.equal(Object.keys(allLessons).length,35);
assert.equal(allLessons['trig-basic-identities-pythagorean-identities'],existingPilot['trig-basic-identities-pythagorean-identities']);
const blockIds=new Set();
for(const [id,lesson] of Object.entries(lessons)){
 assert(idSet.has(id));assert.equal(lesson.id,id);assert.equal(lesson.status,'draft');assert.equal(lesson.sections.length,3);
 const blocks=lesson.sections.flatMap(s=>s.blocks);
 assert(blocks.some(b=>b.type==='definition'));
 assert(blocks.some(b=>b.type==='checkpoint'));
 assert(blocks.filter(b=>b.type==='formula').length>=2);
 assert(blocks.filter(b=>b.type==='worked-example').length>=2);
 assert(blocks.some(b=>b.type==='note'&&b.text.startsWith('Reference guide:')));
 for(const b of blocks){assert(!blockIds.has(b.id),'duplicate block '+b.id);blockIds.add(b.id);if(b.type==='formula'){
  assert(b.latex.includes('\\'),'missing TeX escapes in '+id);
  assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(b.latex),'formula control character '+id);
  assert(!b.latex.includes('\t'),'tab in formula '+id);
  const count=(s,chr)=>(s.match(new RegExp('\\'+chr,'g'))??[]).length;
  assert.equal(count(b.latex,'{'),count(b.latex,'}'),'unmatched formula braces '+id);
 } if(b.type==='worked-example'){assert(b.steps.length>=2&&b.check.length>=12);}}
}
const ids=new Set();const keyed=new Set();
for(const q of items){
 assert(!ids.has(q.id),'duplicate question '+q.id);ids.add(q.id);
 assert(focus.has(q.subtopicId));assert(['Basic','Intermediate','Advanced'].includes(q.difficulty));
 assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4,'duplicate options '+q.id);
 assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4);
 assert.equal(q.options[q.correctIndex],ledger[q.id],q.id+' failed independent answer ledger');
 assert(!keyed.has(q.subtopicId+'|'+q.prompt.toLowerCase()));keyed.add(q.subtopicId+'|'+q.prompt.toLowerCase());
 assert(q.explanation.length>=28);
}
for(const id of focus)assert.equal(items.filter(q=>q.subtopicId===id).length,8);
const {PRACTICE_CATALOG: allCatalog,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
const PRACTICE_CATALOG=allCatalog.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI47-')&&!q.key.startsWith('trigonometry-pilot:TRI48-')); 
assert(PRACTICE_CATALOG.length>=702);assert.equal(new Set(PRACTICE_CATALOG.map(q=>q.key)).size,PRACTICE_CATALOG.length);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId!=='trigonometry-pilot').length,422);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId==='trigonometry-pilot'&&!q.key.startsWith('trigonometry-pilot:TRI41-')&&!q.key.startsWith('trigonometry-pilot:TRI42-')&&!q.key.startsWith('trigonometry-pilot:TRI43-')&&!q.key.startsWith('trigonometry-pilot:TRI44-')&&!q.key.startsWith('trigonometry-pilot:TRI45-')&&!q.key.startsWith('trigonometry-pilot:TRI46-')).length,280);
for(const s of topic05.subtopics){
 const found=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:s.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(found.length,8,`Topic 05 question coverage for ${s.number}`);
 assert(found.every(q=>q.reviewStatus==='draft-unverified'));
}
// Evaluate representative algebraic/trigonometric relations numerically away from singularities.
const near=(a,b,t='')=>assert(Math.abs(a-b)<1e-9,t+': '+a+' vs '+b);
for(const theta of [0.41,-0.72,1.13,2.38,-2.66]){
 const s=Math.sin(theta),c=Math.cos(theta),tan=s/c,sec=1/c,csc=1/s;
 near(s*csc,1,'reciprocal');near(c*sec,1,'reciprocal');
 near(tan*c,s,'quotient');near(Math.tan(-theta),-tan,'odd tan');near(Math.cos(-theta),c,'even cos');
 near(Math.sin(Math.PI/2-theta),c,'cofunction');
 near((1-Math.cos(theta)**2)/s,s,'simplification');
 near((1-c)*(1+c),s*s,'conjugates');
 near((1-c)/s,s/(1+c),'fractional identity');
}
near(1/Math.cos(Math.PI/3),2);near(Math.sin(-Math.PI/6),-.5);near(1/Math.tan(Math.PI/3),Math.sqrt(3)/3);
near((1-0.6**2)/(0.8),0.8);
// Track new ID without modifying a saved legacy Algebra or original Trigonometry record.
const store=load('src/domain/learn/manualLearnTracking.ts');const adapter=load('src/features/trigonometry/manualProgressAdapter.ts');
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};globalThis.window={dispatchEvent:()=>{}};
const prior={...store.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:true,updatedAt:'2026-01-01T00:00:00.000Z'};
storage.set(store.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-existing':prior,'trig-basic-identities-pythagorean-identities':prior}}));
const selected=[...focus][0];assert(store.isManualTrackingId(selected));
adapter.saveTrigManualProgress(selected,{read1:true,read2:true,read3:true,mastered:true,review:true});
const updated=store.readManualLearnStore().records;
assert.deepEqual(updated['alg-existing'],prior);assert.deepEqual(updated['trig-basic-identities-pythagorean-identities'],prior);
assert.equal(updated[selected].reviewCount,3);assert.equal(updated[selected].selfStatus,'mastered');assert.equal(updated[selected].needsReview,true);
const screen=read('src/features/trigonometry/TrigonometryScreen.tsx');assert(screen.includes('TRIGONOMETRY_FUNDAMENTAL_IDENTITIES_LESSONS'));
const practice=read('src/domain/practice/catalog.ts');assert(practice.includes('TRIGONOMETRY_FUNDAMENTAL_IDENTITIES_QUESTIONS'));
for(const file of ['src/data/lessons/trigonometryFundamentalIdentities.ts','src/data/practice/trigonometryFundamentalIdentities.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/domain/practice/catalog.ts']){
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,file);
}
assert(/^10\.(40|41|42|43|44|45|46|47|48|49|50)\.0$/.test(json('package.json').version)||['10.50.1','10.50.2','10.50.3','10.51.0', '10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(json('package.json').version));assert.equal(json('package-lock.json').version,json('package.json').version);
console.log('PASS v10.40.0: Topic 05 6/6 draft lessons, 48 questions; 35/102 overall draft lessons, 280 questions; 5 authored lessons and 40 questions structurally verified, mathematical representative values checked, progress & Algebra preserved, TypeScript syntax okay.');
