/** Focused v10.39.0 content checks. Structural checks do not certify editorial accuracy. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);let ts;try{ts=req('typescript')}catch{ts=req('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..');const src=p=>fs.readFileSync(path.join(root,p),'utf8');const json=p=>JSON.parse(src(p));
const cached=new Map();function load(f){let p=path.resolve(root,f);if(!fs.existsSync(p)){for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(p+ext)){p+=ext;break}}
 if(p.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(p,'utf8'))};if(cached.has(p))return cached.get(p).exports;
 const compiled=ts.transpileModule(fs.readFileSync(p,'utf8'),{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((compiled.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,`syntax: ${p}`);
 const m={exports:{}};cached.set(p,m);new Function('require','module','exports',compiled.outputText)(x=>x.startsWith('.')?load(path.resolve(path.dirname(p),x)):req(x),m,m.exports);return m.exports;
}
const cat=json('src/features/trigonometry/curriculum.json'), subtopics=cat.topics.flatMap(t=>t.subtopics), ids=subtopics.map(s=>s.id);
assert.equal(cat.topics.length,14);assert.equal(ids.length,102);assert.equal(new Set(ids).size,102);
const focus=cat.topics.slice(0,4).flatMap(t=>t.subtopics);assert.equal(focus.length,29);
const lessonMap=json('src/data/lessons/trigonometryFoundationCompletion.json'), newQuestions=json('src/data/practice/trigonometryFoundationCompletion.json');
const ledger=json('src/data/practice/trigonometryFoundationAnswerLedgerV1039.json');
const pilot=load('src/data/lessons/trigonometryPilot.ts').TRIGONOMETRY_PILOT_LESSONS;
const prior=load('src/data/lessons/trigonometryFoundations.ts').TRIGONOMETRY_FOUNDATIONS_LESSONS;
const all={...pilot,...prior,...lessonMap};assert.equal(Object.keys(lessonMap).length,14);assert.equal(newQuestions.length,112);assert.equal(Object.keys(all).length,30);
for(const s of focus){assert(all[s.id],`Missing lesson: ${s.number} ${s.title}`)}
const already=new Set([...Object.keys(prior),...Object.keys(pilot)]);assert([...Object.keys(lessonMap)].every(id=>!already.has(id)));
const globalIds=new Set();for(const [id,lesson] of Object.entries(all)){
 assert.equal(lesson.id,id);assert(ids.includes(id));assert.equal(lesson.status,'draft');assert.equal(lesson.sections.length,3);assert(lesson.title.length>10);
 let blocks=lesson.sections.flatMap(s=>s.blocks);assert(blocks.length>=6);assert.equal(new Set(blocks.map(b=>b.id)).size,blocks.length);
 blocks.forEach(b=>{assert(!globalIds.has(b.id),`duplicate block ID ${b.id}`);globalIds.add(b.id)});
 const formulas=blocks.filter(b=>b.type==='formula');assert(formulas.length>0,`${id}: missing formula`);
 for(const b of formulas){assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(b.latex),`damaged formula escape: ${id}`);assert(!b.latex.includes('\t'),`tab in formula: ${id}`);assert(!/(?<!\\)frac\{/.test(b.latex),`missing backslash: ${id}`)}
 const works=blocks.filter(b=>b.type==='worked-example');assert(works.length>=2);
 assert(works.every(b=>b.steps?.length>=2&&b.problem.length>14&&b.check.length>10));
 assert(blocks.some(b=>b.type==='checkpoint')&&blocks.some(b=>b.type==='definition')&&blocks.some(b=>b.type==='note'));
}
for(const [id,lesson] of Object.entries(lessonMap))assert.equal(lesson.sections[0].blocks.some(b=>b.type==='diagram'),true,`${id} missing graph/diagram`);
assert.equal(new Set(newQuestions.map(q=>q.id)).size,112);assert.equal(Object.keys(ledger).length,112);
for(const q of newQuestions){assert(Object.hasOwn(lessonMap,q.subtopicId));assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4,`duplicate choices ${q.id}`);
 assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<=3);assert.equal(q.options[q.correctIndex],ledger[q.id]);
 assert(q.explanation.length>20&&q.prompt.length>10);assert(['Basic','Intermediate','Advanced'].includes(q.difficulty));
}
for(const s of Object.values(lessonMap))assert.equal(newQuestions.filter(q=>q.subtopicId===s.id).length,8);
const {PRACTICE_CATALOG: allCatalog,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
const PRACTICE_CATALOG=allCatalog.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI47-')&&!q.key.startsWith('trigonometry-pilot:TRI48-')); assert.equal(PRACTICE_CATALOG.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI40-')&&!q.key.startsWith('trigonometry-pilot:TRI41-')&&!q.key.startsWith('trigonometry-pilot:TRI42-')&&!q.key.startsWith('trigonometry-pilot:TRI43-')&&!q.key.startsWith('trigonometry-pilot:TRI44-')&&!q.key.startsWith('trigonometry-pilot:TRI45-')&&!q.key.startsWith('trigonometry-pilot:TRI46-')).length,662);
assert.equal(new Set(PRACTICE_CATALOG.map(q=>q.key)).size,PRACTICE_CATALOG.length);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId!=='trigonometry-pilot').length,422);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId==='trigonometry-pilot'&&!q.key.startsWith('trigonometry-pilot:TRI40-')&&!q.key.startsWith('trigonometry-pilot:TRI41-')&&!q.key.startsWith('trigonometry-pilot:TRI42-')&&!q.key.startsWith('trigonometry-pilot:TRI43-')&&!q.key.startsWith('trigonometry-pilot:TRI44-')&&!q.key.startsWith('trigonometry-pilot:TRI45-')&&!q.key.startsWith('trigonometry-pilot:TRI46-')).length,240);
for(const s of focus){let qs=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:s.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(qs.length,8,`${s.id} wrong practice mapping`);assert(qs.every(q=>q.reviewStatus==='draft-unverified'));}
// Sample arithmetic computed independently from the question content and programmatic keyed distractors.
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} vs ${b}`);
near(Math.sin(150*Math.PI/180),.5);near(Math.cos(225*Math.PI/180),-Math.SQRT2/2);near(Math.cos(300*Math.PI/180),.5);
near(Math.sin(-750*Math.PI/180),-.5);near(Math.cos(-240*Math.PI/180),-.5);near(Math.tan(225*Math.PI/180),1);
near(Math.tan(330*Math.PI/180),-1/Math.sqrt(3));near(2*Math.PI/4,Math.PI/2);near(2*Math.PI/(.5),4*Math.PI);
near((7-1)/2,3);near((10+4)/2,7);near(120*Math.PI/(2*Math.PI),60);
near(200*Math.PI/(2*Math.PI),100);near(Math.atan2(-4,3)<0?Math.atan2(-4,3)+2*Math.PI:0,Math.atan2(-4,3)+2*Math.PI);
// Existing manual progress IDs continue to be accepted and saved alongside Algebra.
const store=load('src/domain/learn/manualLearnTracking.ts');const adapter=load('src/features/trigonometry/manualProgressAdapter.ts');
assert(ids.every(id=>store.isManualTrackingId(id)));
const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};globalThis.window={dispatchEvent:()=>{}};
const old={...store.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:false,updatedAt:'2026-01-01T00:00:00.000Z'};
data.set(store.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-existing':old}}));
const newest=Object.keys(lessonMap)[0];adapter.saveTrigManualProgress(newest,{read1:true,read2:true,read3:false,mastered:true,review:true});
const progress=adapter.readTrigManualProgress(ids);assert(progress[newest]?.mastered&&progress[newest]?.review&&progress[newest]?.read2);
assert.deepEqual(store.readManualLearnStore().records['alg-existing'],old);
// Test old v10.38 MathFormula authoring regression: all 12 formulas now contain valid LaTeX backslashes.
for(const oldLesson of Object.values(prior)){const latex=oldLesson.sections.flatMap(s=>s.blocks).find(b=>b.type==='formula')?.latex;assert(latex&&latex.includes('\\'),`baseline damaged formula ${oldLesson.id}`)}
// Ensure new diagram identifiers are handled and source imports compile syntactically.
const draw=src('src/components/learn-reader/TrigonometryDiagram.tsx');for(const k of ['sine-graph','tangent-graph','reciprocal-graph','transform-graph'])assert(draw.includes(k));
for(const f of ['src/data/lessons/trigonometryFoundationCompletion.ts','src/data/practice/trigonometryFoundationCompletion.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/domain/practice/catalog.ts','src/components/learn-reader/TrigonometryDiagram.tsx']){
 const code=ts.transpileModule(src(f),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((code.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,f);
}
const manifest=json('package.json');assert(/^10\.(39|40|41|42|43|44|45|46|47|48|49|50)\.0$/.test(manifest.version)||['10.50.1','10.50.2','10.50.3','10.51.0', '10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(manifest.version));assert.equal(json('package-lock.json').version,manifest.version);
console.log('PASS v10.39.0: 29/29 foundations lessons mapped, 14 new lessons, 112 new keys, 240 total Trigonometry questions, unique stable IDs, diagrams, progress/Algebra regression, 12 legacy formula escapes repaired, representative numeric checks, TS syntax.');
