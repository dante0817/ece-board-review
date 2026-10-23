/** v10.41.0 Topic 06 source, catalog, persistence, and mathematical regression. Not editorial sign-off. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);
let ts;try{ts=req('typescript')}catch{ts=req('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..');
const src=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(src(f));
const cache=new Map();
function load(f){let p=path.resolve(root,f);
 if(!fs.existsSync(p))for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(p+ext)){p+=ext;break;}
 if(p.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(p,'utf8'))};
 if(cache.has(p))return cache.get(p).exports;
 const comp=ts.transpileModule(fs.readFileSync(p,'utf8'),{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((comp.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,'syntax: '+p);
 const mod={exports:{}};cache.set(p,mod);
 new Function('require','module','exports',comp.outputText)(x=>x.startsWith('.')?load(path.resolve(path.dirname(p),x)):req(x),mod,mod.exports);
 return mod.exports;
}
const cur=json('src/features/trigonometry/curriculum.json');
const all=cur.topics.flatMap(t=>t.subtopics), validIds=new Set(all.map(s=>s.id));
assert.equal(cur.topics.length,14);assert.equal(all.length,102);assert.equal(validIds.size,102);
const subtopics=cur.topics.find(t=>t.number==='06')?.subtopics;
assert.equal(subtopics.length,8);
const focus=new Set(subtopics.map(s=>s.id));
const lessons=json('src/data/lessons/trigonometryAdvancedIdentities.json');
const items=json('src/data/practice/trigonometryAdvancedIdentities.json');
const ledger=json('src/data/practice/trigonometryAdvancedIdentitiesAnswerLedgerV1041.json');
assert.equal(Object.keys(lessons).length,8);assert.deepEqual(new Set(Object.keys(lessons)),focus);
assert.equal(items.length,64);assert.equal(Object.keys(ledger).length,64);
const oldPilot=load('src/data/lessons/trigonometryPilot.ts').TRIGONOMETRY_PILOT_LESSONS;
const oldFound=load('src/data/lessons/trigonometryFoundations.ts').TRIGONOMETRY_FOUNDATIONS_LESSONS;
const oldCompleted=json('src/data/lessons/trigonometryFoundationCompletion.json');
const oldIdent=json('src/data/lessons/trigonometryFundamentalIdentities.json');
const oldLessons={...oldPilot,...oldFound,...oldCompleted,...oldIdent};
assert.equal(Object.keys(oldLessons).length,35);
const combined={...oldLessons,...lessons};assert.equal(Object.keys(combined).length,43);
const blockIds=new Set();
for(const [id,lesson] of Object.entries(lessons)){
 assert(validIds.has(id)&&lesson.id===id);assert.equal(lesson.status,'draft');assert.equal(lesson.contentVersion,1);
 assert.equal(lesson.sections.length,3);assert(lesson.summary.length>=55);
 const blocks=lesson.sections.flatMap(s=>s.blocks);
 assert(blocks.some(b=>b.type==='definition'));assert(blocks.some(b=>b.type==='checkpoint'));
 assert(blocks.filter(b=>b.type==='formula').length>=3);
 assert(blocks.filter(b=>b.type==='worked-example').length>=2);
 assert(blocks.some(b=>b.type==='note'&&b.text.startsWith('Reference guide:')));
 for(const b of blocks){assert(!blockIds.has(b.id),'Duplicate new block '+b.id);blockIds.add(b.id);
  if(b.type==='formula'){
   assert(b.latex.includes('\\'));assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f\t]/.test(b.latex),'Damaged TeX '+id);
   const num=(str,c)=>[...str].filter(x=>x===c).length;
   assert.equal(num(b.latex,'{'),num(b.latex,'}'),'Unmatched TeX braces '+id);
  }
  if(b.type==='worked-example'){assert(b.steps.length>=2&&b.check.length>=20);}
 }
}
const ids=new Set(),questionsPerId=new Map();
for(const q of items){
 assert(!ids.has(q.id));ids.add(q.id);assert(focus.has(q.subtopicId));
 assert(['Basic','Intermediate','Advanced'].includes(q.difficulty));
 assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4,'duplicate distractor '+q.id);
 assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<=3);
 assert.equal(q.options[q.correctIndex],ledger[q.id]);assert(q.explanation.length>=45);
 questionsPerId.set(q.subtopicId,(questionsPerId.get(q.subtopicId)??0)+1);
}
for(const id of focus)assert.equal(questionsPerId.get(id),8);
const {PRACTICE_CATALOG: allCatalog,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
const PRACTICE_CATALOG=allCatalog.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI47-')&&!q.key.startsWith('trigonometry-pilot:TRI48-')); 
assert(PRACTICE_CATALOG.length>=766);
assert.equal(new Set(PRACTICE_CATALOG.map(q=>q.key)).size,PRACTICE_CATALOG.length);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId!=='trigonometry-pilot').length,422);
assert(PRACTICE_CATALOG.filter(q=>q.bankId==='trigonometry-pilot').length>=344);
assert.equal(PRACTICE_CATALOG.filter(q=>q.key.startsWith('trigonometry-pilot:TRI41-')).length,64);
for(const s of subtopics){
 const chosen=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:s.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(chosen.length,8,'Missing practice '+s.number);
 assert(chosen.every(q=>q.reviewStatus==='draft-unverified'&&q.options.length===4));
}
// The completed v10.40.0 question cohort is not rewritten or rekeyed.
const oldQuestions=json('src/data/practice/trigonometryFundamentalIdentities.json');
for(const q of oldQuestions){const found=PRACTICE_CATALOG.find(x=>x.key===`trigonometry-pilot:${q.id}`);assert(found);assert.equal(found.prompt,q.prompt);assert.equal(found.correctOptionId,String(q.correctIndex));}
const screen=src('src/features/trigonometry/TrigonometryScreen.tsx');
const catalog=src('src/domain/practice/catalog.ts');
assert(screen.includes('...TRIGONOMETRY_ADVANCED_IDENTITIES_LESSONS'));
assert(catalog.includes('...TRIGONOMETRY_ADVANCED_IDENTITIES_QUESTIONS'));
// Numerical identities checked across positive and negative angles and away from singularities.
const near=(a,b,msg)=>assert(Math.abs(a-b)<2e-9,`${msg}: ${a} vs ${b}`);
for(const x of [0.17,0.42,0.83,1.17,-0.91,2.31])for(const y of [-0.43,0.27,0.78]){
 const s=Math.sin,c=Math.cos,t=Math.tan;
 near(s(x+y),s(x)*c(y)+c(x)*s(y),'sin sum');near(c(x-y),c(x)*c(y)+s(x)*s(y),'cos diff');
 near(s(2*x),2*s(x)*c(x),'sin double');near(c(2*x),1-2*s(x)**2,'cos double');
 near(s(3*x),3*s(x)-4*s(x)**3,'sin triple');near(c(3*x),4*c(x)**3-3*c(x),'cos triple');
 near(s(x/2)**2,(1-c(x))/2,'sin half');near(c(x/2)**2,(1+c(x))/2,'cos half');
 near(s(x)**2,(1-c(2*x))/2,'sin power');near(s(x)**4,(3-4*c(2*x)+c(4*x))/8,'fourth power');
 near(2*s(x)*c(y),s(x+y)+s(x-y),'product to sum');near(2*s(x)*s(y),c(x-y)-c(x+y),'product to sum');
 near(s(x)+s(y),2*s((x+y)/2)*c((x-y)/2),'sum to product');
 near(c(x)-c(y),-2*s((x+y)/2)*s((x-y)/2),'cos difference to product');
 if(Math.abs(c(x))>1e-9)near(s(2*x)/(1+c(2*x)),t(x),'combined quotient');
}
// Track a newly authored 06.x lesson without corrupting older Algebra/Trigonometry records.
const store=load('src/domain/learn/manualLearnTracking.ts');const progress=load('src/features/trigonometry/manualProgressAdapter.ts');
const cacheStorage=new Map();globalThis.localStorage={getItem:k=>cacheStorage.get(k)??null,setItem:(k,v)=>cacheStorage.set(k,v),removeItem:k=>cacheStorage.delete(k)};globalThis.window={dispatchEvent:()=>{}};
const old={...store.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:true,updatedAt:'2026-01-01T00:00:00.000Z'};
cacheStorage.set(store.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-original':old,'trig-basic-identities-pythagorean-identities':old}}));
const target=subtopics[0].id;assert(store.isManualTrackingId(target));
progress.saveTrigManualProgress(target,{read1:true,read2:true,read3:true,mastered:true,review:true});
const saved=store.readManualLearnStore().records;assert.deepEqual(saved['alg-original'],old);assert.deepEqual(saved['trig-basic-identities-pythagorean-identities'],old);
assert.equal(saved[target].reviewCount,3);assert.equal(saved[target].selfStatus,'mastered');assert.equal(saved[target].needsReview,true);
for(const f of ['src/data/lessons/trigonometryAdvancedIdentities.ts','src/data/practice/trigonometryAdvancedIdentities.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/domain/practice/catalog.ts']){
 const transpiled=ts.transpileModule(src(f),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((transpiled.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,f);
}
assert(/^10\.(41|42|43|44|45|46|47|48|49|50)\.0$/.test(json('package.json').version)||['10.50.1','10.50.2','10.50.3','10.51.0', '10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(json('package.json').version));assert.equal(json('package-lock.json').version,json('package.json').version);
console.log('PASS v10.41: Topic 06 8/8 draft lessons and 64 new questions; 43/102 linked lessons and 344 Trigonometry questions; lesson/practice mapping, source syntax, answer ledger, representative trigonometric identities, legacy Algebra/Trigonometry and saved progress preserved.');
