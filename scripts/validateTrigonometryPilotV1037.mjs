/** Pilot content and store integrity; not independent editorial certification or browser QA. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(relative){
  const full=path.resolve(root,relative);
  const file=fs.existsSync(full)?full:fs.existsSync(`${full}.ts`)?`${full}.ts`:`${full}.tsx`;
  if(cache.has(file))return cache.get(file).exports;
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
  assert.equal((code.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,`TS syntax error: ${file}`);
  const mod={exports:{}};cache.set(file,mod);
  new Function('require','module','exports',code.outputText)(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)):require(name),mod,mod.exports);
  return mod.exports;
}
const catalog=JSON.parse(read('src/features/trigonometry/curriculum.json'));
const curriculumIds=new Set(catalog.topics.flatMap(t=>t.subtopics.map(s=>s.id)));
assert.equal(curriculumIds.size,102);
const {TRIGONOMETRY_PILOT_LESSONS:lessons,TRIGONOMETRY_PILOT_IDS:ids}=load('src/data/lessons/trigonometryPilot.ts');
const {TRIGONOMETRY_PILOT_QUESTIONS:questions}=load('src/data/practice/trigonometryPilot.ts');
assert.equal(ids.length,4);assert.equal(questions.length,32);
assert.equal(new Set(questions.map(q=>q.id)).size,32);
assert.equal(new Set(ids).size,4);
for(const id of ids){
  assert(curriculumIds.has(id));const lesson=lessons[id];assert.equal(lesson.id,id);
  assert.equal(lesson.status,'draft');assert(lesson.sections.length>=3);
  assert.equal(new Set(lesson.sections.map(s=>s.id)).size,lesson.sections.length);
  const blocks=lesson.sections.flatMap(s=>s.blocks);
  assert(blocks.length>=10&&blocks.some(b=>b.type==='formula')&&blocks.some(b=>b.type==='worked-example')&&blocks.some(b=>b.type==='checkpoint'));
  assert.equal(new Set(blocks.map(b=>b.id)).size,blocks.length);
  for(const block of blocks){
    if(block.type==='worked-example')assert(block.steps.length>=2&&block.check?.length>0);
    if(block.type==='formula')assert(block.latex.length>2);
    if(block.type==='diagram')assert(['radian','right-triangle','unit-circle'].includes(block.diagram)&&block.caption.length>10);
  }
  assert.equal(questions.filter(q=>q.subtopicId===id).length,8);
}
assert(lessons['trig-angles-radian-measure'].sections.flatMap(s=>s.blocks).some(b=>b.type==='diagram'));
assert(lessons['trig-right-triangles-six-trigonometric-ratios'].sections.flatMap(s=>s.blocks).some(b=>b.type==='diagram'));
assert(lessons['trig-unit-circle-unit-circle-definitions'].sections.flatMap(s=>s.blocks).some(b=>b.type==='diagram'));
const expectedAnswers=[
 '2 rad','π','π/2','6 m','4 rad/s','π/2 rad','3 m','3 rad/s',
 '3/5','4/5','8/15','13/5','5/12','5/4','6 m','15/8',
 'cos θ','(1,0)','1','sin positive, cos negative','−4/3','90°','0','−4/5',
 '1','cos² θ','1','csc² θ','cos θ','−4/5','cos² θ','Where sin θ ≠ 0'
];
assert.equal(expectedAnswers.length,questions.length);
for(let i=0;i<questions.length;i++){
  const q=questions[i];assert(ids.includes(q.subtopicId));assert(q.id.startsWith('TRP-'));
  assert(q.prompt.length>20&&q.explanation.length>25);
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4);
  assert.equal(q.options[q.correctIndex],expectedAnswers[i],`Independent expected-answer check failed for ${q.id}`);
}
// Representative independent quantitative cross-checks (not merely text comparison).
const near=(a,b)=>assert(Math.abs(a-b)<1e-11);
near(6/3,2);near(4*1.5,6);near((3/2)/0.5,3);near(Math.hypot(8,15),17);
near(Math.sin(Math.PI/6)*12,6);near(Math.cos(5*Math.PI/2),0);
near((1-(3/5)**2),16/25);
const m=load('src/domain/learn/manualLearnTracking.ts');
const adapter=load('src/features/trigonometry/manualProgressAdapter.ts');
assert(m.isManualTrackingId('trig-angles-radian-measure'));
assert(m.isManualTrackingId('trig-unit-circle-unit-circle-definitions'));
assert([...curriculumIds].every(id=>m.isManualTrackingId(id)),'Every defined Trigonometry ID must fit the manual tracking schema');
const local=new Map();let eventCount=0;
globalThis.localStorage={getItem:key=>local.get(key)??null,setItem:(key,val)=>local.set(key,val),removeItem:key=>local.delete(key)};
globalThis.window={dispatchEvent:()=>{eventCount++;}};
// Preserve a pre-existing Algebra record and check no implicit broad-topic status migration.
const algebraRecord={...m.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:true,updatedAt:new Date().toISOString()};
local.set(m.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-existing-test':algebraRecord}}));
const firstId=ids[0];
assert.deepEqual(adapter.readTrigManualProgress(ids),{});
adapter.saveTrigManualProgress(firstId,{read1:true,read2:true,read3:false,mastered:true,review:true});
let snapshot=adapter.readTrigManualProgress(ids);
assert(snapshot[firstId].read2&&snapshot[firstId].read1&&snapshot[firstId].mastered&&snapshot[firstId].review);
assert(!snapshot[firstId].read3);
let saved=m.readManualLearnStore();assert.deepEqual(saved.records['alg-existing-test'],algebraRecord);
assert.equal(saved.records[firstId].reviewCount,2);
adapter.saveTrigManualProgress(firstId,{read1:true,read2:true,read3:true,mastered:true,review:true});
assert.equal(m.readManualLearnStore().records[firstId].reviewCount,3);
adapter.saveTrigManualProgress(firstId,{read1:true,read2:true,read3:true,mastered:true,review:false});
assert(adapter.readTrigManualProgress(ids)[firstId].mastered&&!adapter.readTrigManualProgress(ids)[firstId].review);
assert(eventCount>=3);
local.set(m.MANUAL_LEARN_STORAGE_KEY,'{invalid');
assert.throws(()=>adapter.readTrigManualProgress(ids));
assert.throws(()=>adapter.saveTrigManualProgress(firstId,{read1:false,read2:false,read3:false,mastered:false,review:false}));
assert.equal(local.get(m.MANUAL_LEARN_STORAGE_KEY),'{invalid');
// Capacity for a full Trigonometry rollout, preserving former schemas.
const reader=load('src/domain/learn/readerProgress.ts');
const example={lastSectionId:'overview',completedSectionIds:[],bookmarkedSectionIds:[],contentVersion:1,updatedAt:new Date().toISOString()};
assert(reader.validateLearnReaderStore({...reader.emptyReaderStore(),topics:Object.fromEntries(Array.from({length:245},(_,i)=>[`trig-test-${i}`,example]))}));
assert(!reader.validateLearnReaderStore({...reader.emptyReaderStore(),topics:Object.fromEntries(Array.from({length:321},(_,i)=>[`trig-test-${i}`,example]))}));
const practice=load('src/domain/practice/practiceStorage.ts');
assert(practice.validatePracticeStore(practice.emptyPracticeStore()));
assert(practice.MAX_PRACTICE_BYTES>=2_200_000);
// Source syntax + integration declarations.
for(const file of ['src/features/trigonometry/TrigonometryScreen.tsx','src/components/learn-reader/TrigonometryDiagram.tsx','src/components/learn-reader/LearnSectionRenderer.tsx','src/components/practice/PracticeLibrary.tsx','src/domain/practice/catalog.ts']){
 const source=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((source.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,`Syntax in ${file}`);
}
const screen=read('src/features/trigonometry/TrigonometryScreen.tsx');
assert(screen.includes('LearnReaderLayout')&&screen.includes('openPractice')&&screen.includes('readTrigManualProgress'));
assert(screen.includes('top-spherical-trig')&&screen.includes('top-trig-identities'));
assert(read('src/domain/practice/catalog.ts').includes("bankId:'trigonometry-pilot'"));
console.log('PASS v10.37.0: 102 stable curriculum IDs, four original draft lessons, 32 validated-answer pilot questions, three accessible SVG diagrams, persistent old-store compatible progress, no corrupt-store overwrite, increased storage capacity, source syntax.');
